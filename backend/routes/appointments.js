const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const TimeSlot = require('../models/TimeSlot');
const EmailService = require('../services/emailService');
const emailScheduler = require('../services/emailScheduler');

const timeStringToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTimeString = (minutes) => {
  const hrs = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}`;
};

const normalizeDate = (dateString) => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
};

const buildDailyAvailability = (timeSlots, appointments, duration) => {
  const availability = [];

  timeSlots.forEach(slot => {
    const startMinutes = timeStringToMinutes(slot.startTime);
    const endMinutes = timeStringToMinutes(slot.endTime);

    // Generate slots every 15 minutes
    for (let start = startMinutes; start + duration <= endMinutes; start += 15) {
      const end = start + duration;
      
      // Check for conflicts with both pending and confirmed appointments
      const overlaps = appointments.some(appt => {
        // Include both pending and confirmed appointments in conflict detection
        if (!['pending', 'confirmed'].includes(appt.status)) return false;
        
        const apptStart = timeStringToMinutes(appt.time);
        const apptEnd = apptStart + (appt.totalDuration || 30);
        
        // Check for any overlap
        return start < apptEnd && end > apptStart;
      });

      if (!overlaps) {
        availability.push(minutesToTimeString(start));
      }
    }
  });

  return [...new Set(availability)].sort((a, b) => timeStringToMinutes(a) - timeStringToMinutes(b));
};

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('barberId')
      .populate('services');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get availability for a given date/barber/duration with advanced slot management
router.get('/availability', async (req, res) => {
  try {
    const { barberId, date, duration } = req.query;
    if (!barberId || !date || !duration) {
      return res.status(400).json({ message: 'barberId, date, and duration are required' });
    }

    const normalizedDate = normalizeDate(date);
    const dayOfWeek = normalizedDate.getDay();

    // Get working hours for the day
    const timeSlots = await TimeSlot.find({
      barberId,
      dayOfWeek,
      isAvailable: true
    });

    if (!timeSlots.length) {
      return res.json({ 
        availableTimes: [],
        message: 'No working hours configured for this day'
      });
    }

    // Get all appointments for the day (including pending ones for conflict detection)
    const appointments = await Appointment.find({
      barberId,
      date: normalizedDate,
      status: { $in: ['pending', 'confirmed'] } // Include both pending and confirmed
    });

    const availableTimes = buildDailyAvailability(timeSlots, appointments, parseInt(duration, 10));
    
    res.json({ 
      availableTimes,
      totalSlots: availableTimes.length,
      workingHours: timeSlots.map(slot => ({
        start: slot.startTime,
        end: slot.endTime
      })),
      bookedSlots: appointments.length
    });
  } catch (error) {
    console.error('Availability check error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create appointment with advanced slot reservation
router.post('/', async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      notes,
      marketingOptIn,
      barberId,
      services,
      date,
      time
    } = req.body;

    if (!customerName || !customerPhone || !barberId || !services?.length || !date || !time) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['customerName', 'customerPhone', 'barberId', 'services', 'date', 'time']
      });
    }

    const normalizedDate = normalizeDate(date);
    const serviceDocs = await Service.find({ _id: { $in: services } });

    if (!serviceDocs.length || serviceDocs.length !== services.length) {
      return res.status(400).json({ message: 'Invalid services selection' });
    }

    const totalPrice = serviceDocs.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = serviceDocs.reduce((sum, s) => sum + s.duration, 0);

    // Validate working hours
    const dayOfWeek = normalizedDate.getDay();
    const availableSlots = await TimeSlot.find({ barberId, dayOfWeek, isAvailable: true });

    if (!availableSlots.length) {
      return res.status(400).json({ message: 'No working hours configured for this day' });
    }

    // Real-time availability check with conflict detection
    const existingAppointments = await Appointment.find({ 
      barberId, 
      date: normalizedDate,
      status: { $in: ['pending', 'confirmed'] }
    });
    
    const validTimes = buildDailyAvailability(availableSlots, existingAppointments, totalDuration);

    if (!validTimes.includes(time)) {
      return res.status(409).json({ 
        message: 'Selected time slot is no longer available',
        availableTimes: validTimes,
        requestedTime: time
      });
    }

    // Double-check for race conditions
    const conflictCheck = await Appointment.findOne({
      barberId,
      date: normalizedDate,
      time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflictCheck) {
      return res.status(409).json({ 
        message: 'Time slot was just booked by another customer',
        availableTimes: buildDailyAvailability(availableSlots, [...existingAppointments, conflictCheck], totalDuration)
      });
    }

    // Create appointment with immediate slot reservation
    const appointment = new Appointment({
      customerName,
      customerPhone,
      customerEmail,
      notes,
      barberId,
      services,
      totalPrice,
      totalDuration,
      date: normalizedDate,
      time,
      marketingOptIn,
      status: 'pending' // Start as pending for admin approval
    });

    const savedAppointment = await appointment.save();
    await savedAppointment.populate('services');
    await savedAppointment.populate('barberId');
    
    // Schedule confirmation email if customer provided email
    if (customerEmail) {
      try {
        await emailScheduler.scheduleEmail(
          savedAppointment._id,
          'booking_received',
          customerEmail,
          customerName,
          new Date() // Send immediately
        );
      } catch (emailError) {
        console.error('Email scheduling failed:', emailError);
        // Don't fail the booking if email fails
      }
    }
    
    res.status(201).json({
      ...savedAppointment.toObject(),
      message: 'Appointment request submitted successfully. You will receive confirmation once approved.'
    });
  } catch (error) {
    console.error('Appointment creation error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Time slot already booked' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update appointment with advanced slot management
router.put('/:id', async (req, res) => {
  try {
    const { sendEmail, responseMessage, ...update } = req.body;
    
    // Get the current appointment
    const currentAppointment = await Appointment.findById(req.params.id)
      .populate('barberId')
      .populate('services');
    
    if (!currentAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Handle status changes with slot validation
    if (update.status && update.status !== currentAppointment.status) {
      if (update.status === 'confirmed') {
        // Check for double booking when confirming
        const conflictingAppointments = await Appointment.find({
          _id: { $ne: req.params.id },
          barberId: currentAppointment.barberId,
          date: currentAppointment.date,
          status: 'confirmed',
          $or: [
            {
              $and: [
                { time: { $lte: currentAppointment.time } },
                { $expr: { $gte: [{ $add: [timeStringToMinutes('$time'), '$totalDuration'] }, timeStringToMinutes(currentAppointment.time)] } }
              ]
            },
            {
              $and: [
                { time: { $gte: currentAppointment.time } },
                { time: { $lt: minutesToTimeString(timeStringToMinutes(currentAppointment.time) + currentAppointment.totalDuration) } }
              ]
            }
          ]
        });
        
        if (conflictingAppointments.length > 0) {
          return res.status(409).json({ 
            message: 'Time slot conflict detected. Another appointment is already confirmed for this time.',
            conflictingAppointments: conflictingAppointments.map(apt => ({
              id: apt._id,
              customerName: apt.customerName,
              time: apt.time,
              duration: apt.totalDuration
            }))
          });
        }
      }
    }

    if (update.date) {
      update.date = normalizeDate(update.date);
    }

    // Add response message if provided
    if (responseMessage) {
      update.responseMessage = responseMessage;
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('barberId')
      .populate('services');
    
    // Handle email notifications and scheduling
    if (sendEmail) {
      try {
        if (appointment.status === 'confirmed') {
          // Send confirmation email immediately if customer has email
          if (appointment.customerEmail) {
            await emailScheduler.scheduleEmail(
              appointment._id,
              'confirmation',
              appointment.customerEmail,
              appointment.customerName,
              new Date() // Send immediately
            );
          }
          
          // Schedule reminder email for barber
          await emailScheduler.scheduleReminderEmail(appointment);
          
        } else if (appointment.status === 'cancelled') {
          // Send rejection email immediately if customer has email
          if (appointment.customerEmail) {
            await emailScheduler.scheduleEmail(
              appointment._id,
              'rejection',
              appointment.customerEmail,
              appointment.customerName,
              new Date() // Send immediately
            );
          }
          
          // Cancel any pending reminder emails
          await emailScheduler.cancelAppointmentEmails(appointment._id);
        }
      } catch (emailError) {
        console.error('Email scheduling failed:', emailError);
        // Don't fail the request if email scheduling fails
      }
    }
    
    res.json(appointment);
  } catch (error) {
    console.error('Appointment update error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reserve a time slot temporarily (5 minutes)
router.post('/reserve-slot', async (req, res) => {
  try {
    const { barberId, date, time, duration } = req.body;
    
    if (!barberId || !date || !time || !duration) {
      return res.status(400).json({ message: 'barberId, date, time, and duration are required' });
    }

    const normalizedDate = normalizeDate(date);
    const dayOfWeek = normalizedDate.getDay();

    // Check if slot is still available
    const timeSlots = await TimeSlot.find({ barberId, dayOfWeek, isAvailable: true });
    const appointments = await Appointment.find({ 
      barberId, 
      date: normalizedDate,
      status: { $in: ['pending', 'confirmed'] }
    });

    const availableTimes = buildDailyAvailability(timeSlots, appointments, parseInt(duration));
    
    if (!availableTimes.includes(time)) {
      return res.status(409).json({ 
        message: 'Time slot is no longer available',
        availableTimes
      });
    }

    // Create a temporary reservation token
    const reservationToken = `${barberId}_${date}_${time}_${Date.now()}`;
    
    res.json({ 
      reserved: true,
      reservationToken,
      expiresIn: 300000, // 5 minutes
      message: 'Slot reserved for 5 minutes'
    });
  } catch (error) {
    console.error('Slot reservation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Validate slot availability before booking
router.post('/validate-slot', async (req, res) => {
  try {
    const { barberId, date, time, duration } = req.body;
    
    if (!barberId || !date || !time || !duration) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedDate = normalizeDate(date);
    const dayOfWeek = normalizedDate.getDay();

    // Get working hours
    const timeSlots = await TimeSlot.find({ barberId, dayOfWeek, isAvailable: true });
    
    if (!timeSlots.length) {
      return res.json({ 
        available: false,
        reason: 'No working hours configured for this day'
      });
    }

    // Check for conflicts
    const appointments = await Appointment.find({ 
      barberId, 
      date: normalizedDate,
      status: { $in: ['pending', 'confirmed'] }
    });

    const availableTimes = buildDailyAvailability(timeSlots, appointments, parseInt(duration));
    const isAvailable = availableTimes.includes(time);
    
    res.json({ 
      available: isAvailable,
      reason: isAvailable ? 'Slot is available' : 'Slot is already booked or outside working hours',
      alternativeTimes: isAvailable ? [] : availableTimes.slice(0, 5) // Suggest 5 alternatives
    });
  } catch (error) {
    console.error('Slot validation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Set reminder for appointment
router.post('/:id/reminder', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('barberId')
      .populate('services');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (!appointment.barberId.email) {
      return res.status(400).json({ message: 'Barber email not configured' });
    }
    
    // Use email scheduler for professional reminder handling
    const reminderEmail = await emailScheduler.scheduleReminderEmail(appointment);
    
    if (reminderEmail) {
      res.json({ 
        message: 'Reminder scheduled successfully',
        scheduledFor: reminderEmail.scheduledFor
      });
    } else {
      res.json({ message: 'Reminder time has passed or barber email not configured' });
    }
  } catch (error) {
    console.error('Error setting reminder:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
