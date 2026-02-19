const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const TimeSlot = require('../models/TimeSlot');
const Customer = require('../models/Customer');
const Restriction = require('../models/Restriction');
const EmailService = require('../services/emailService');
const emailScheduler = require('../services/emailScheduler');
const { normalizeDateToGerman, getGermanToday, isBeforeToday } = require('../utils/timezoneHelper');
const jwt = require('jsonwebtoken');

const timeStringToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTimeString = (minutes) => {
  const hrs = Math.floor(minutes / 60).toString().padStart(2, '0');
  const mins = (minutes % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}`;
};

// Use German timezone for all date normalization
const normalizeDate = normalizeDateToGerman;

const upsertCustomerFromAppointment = async ({ name, phone, email, notes, marketingOptIn, appointmentDate }) => {
  if (!phone || !name) return null;

  const customer = await Customer.findOneAndUpdate(
    { phone },
    {
      name,
      phone,
      email,
      notes,
      marketingOptIn,
      $max: { lastAppointmentDate: appointmentDate }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Refresh booking stats based on existing appointments
  const totalBookings = await Appointment.countDocuments({ customer: customer._id });
  if (customer.totalBookings !== totalBookings) {
    customer.totalBookings = totalBookings;
    await customer.save();
  }

  return customer;
};

const buildDailyAvailability = (timeSlots, appointments, duration) => {
  const availability = [];

  timeSlots.forEach(slot => {
    const startMinutes = timeStringToMinutes(slot.startTime);
    const endMinutes = timeStringToMinutes(slot.endTime);

    // Generate slots every 30 minutes, ensuring they start at :00 or :30
    const firstSlot = Math.ceil(startMinutes / 30) * 30;
    for (let start = firstSlot; start + duration <= endMinutes; start += 30) {
      const end = start + duration;
      
      // Check for conflicts with pending, confirmed, and completed appointments
      const overlaps = appointments.some(appt => {
        // Include pending, confirmed, and completed appointments in conflict detection
        if (!['pending', 'confirmed', 'completed'].includes(appt.status)) return false;
        
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
      .populate('services')
      .populate('customer');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get availability for a given date/barber/duration with advanced slot management
router.get('/availability', async (req, res) => {
  try {
    const { barberId, date, duration } = req.query;
    
    console.log('Availability request received:', {
      barberId,
      date,
      duration,
      query: req.query,
      headers: req.headers
    });
    
    if (!barberId || !date || !duration) {
      console.error('Missing required parameters:', { barberId, date, duration });
      return res.status(400).json({ 
        message: 'barberId, date, and duration are required',
        received: { barberId, date, duration }
      });
    }

    const normalizedDate = normalizeDate(date);
    const today = getGermanToday();
    
    // Prevent booking for past dates (using German timezone)
    if (normalizedDate < today) {
      return res.status(400).json({ message: 'Cannot check availability for past dates' });
    }

    // Check if date is restricted (off date)
    const restriction = await Restriction.findOne({ date: normalizedDate });
    if (restriction) {
      return res.json({ 
        availableTimes: [],
        message: 'This date is not available for bookings',
        isRestricted: true
      });
    }

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

    // Get all appointments for the day (including pending, confirmed, and completed)
    const appointments = await Appointment.find({
      barberId,
      date: normalizedDate,
      status: { $in: ['pending', 'confirmed', 'completed'] } // Include pending, confirmed, and completed
    });

    const availableTimes = buildDailyAvailability(timeSlots, appointments, parseInt(duration, 10));
    
    console.log('Availability response:', {
      availableTimes: availableTimes.length,
      totalSlots: availableTimes.length,
      date,
      barberId
    });
    
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
    console.error('Availability check error:', {
      error: error.message,
      stack: error.stack,
      query: req.query
    });
    res.status(500).json({ 
      message: 'Error checking availability',
      error: error.message
    });
  }
});

// Create appointment with advanced slot reservation
router.post('/', async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      customerEmail,
      notes,
      marketingOptIn,
      barberId,
      services,
      date,
      time,
      endTime,
      isBlock,
      status: requestedStatus
    } = req.body;

    // ── BLOCK TIME (admin-only, no customer/service required) ──────────────────
    if (isBlock) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      let isAdmin = false;
      if (token) { try { jwt.verify(token, process.env.JWT_SECRET); isAdmin = true; } catch (_) {} }
      if (!isAdmin) return res.status(403).json({ message: 'Admin authentication required to block time' });

      if (!barberId || !date || !time || !endTime) {
        return res.status(400).json({ message: 'Missing required fields', required: ['barberId', 'date', 'time', 'endTime'] });
      }

      const normalizedDate = normalizeDate(date);

      const blockStart = timeStringToMinutes(time);
      const blockEnd   = timeStringToMinutes(endTime);
      if (blockEnd <= blockStart) {
        return res.status(400).json({ message: 'End time must be after start time' });
      }
      const totalDuration = blockEnd - blockStart;

      const block = new Appointment({
        barberId, date: normalizedDate, time, endTime,
        totalDuration, totalPrice: 0, services: [],
        customerName: '', customerPhone: '',
        notes: notes || '',
        isBlock: true, status: 'confirmed'
      });
      const saved = await block.save();
      return res.status(201).json(saved);
    }
    // ── END BLOCK TIME ─────────────────────────────────────────────────────────

    // Detect admin requests early (they carry a valid JWT)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let isAdminRequest = false;
    if (token) {
      try { jwt.verify(token, process.env.JWT_SECRET); isAdminRequest = true; } catch (_) {}
    }

    // Public bookings require customer info and services; admin can omit them
    if (!isAdminRequest && (!customerName || !customerPhone || !services?.length)) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['customerName', 'customerPhone', 'services']
      });
    }

    if (!barberId || !date || !time) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['barberId', 'date', 'time']
      });
    }

    const normalizedDate = normalizeDate(date);
    const today = getGermanToday();

    // Prevent booking for past dates (admin can bypass this)
    if (!isAdminRequest && normalizedDate < today) {
      return res.status(400).json({ message: 'Cannot book appointments for past dates' });
    }

    // Check if date is restricted (off date) — public only
    if (!isAdminRequest) {
      const restriction = await Restriction.findOne({ date: normalizedDate });
      if (restriction) {
        return res.status(400).json({ message: 'This date is not available for bookings (off date)' });
      }
    }

    let serviceDocs = [];
    let totalPrice = 0;
    let totalDuration = 30; // default when no service selected

    if (services?.length) {
      serviceDocs = await Service.find({ _id: { $in: services } });
      if (!isAdminRequest && (!serviceDocs.length || serviceDocs.length !== services.length)) {
        return res.status(400).json({ message: 'Invalid services selection' });
      }
      if (serviceDocs.length) {
        totalPrice = serviceDocs.reduce((sum, s) => sum + s.price, 0);
        totalDuration = serviceDocs.reduce((sum, s) => sum + s.duration, 0);
      }
    }

    // Validate working hours (admins bypass this entirely)
    const dayOfWeek = normalizedDate.getDay();
    const availableSlots = await TimeSlot.find({ barberId, dayOfWeek, isAvailable: true });

    if (!isAdminRequest && !availableSlots.length) {
      return res.status(400).json({ message: 'No working hours configured for this day' });
    }

    // Real-time availability check with conflict detection
    const existingAppointments = await Appointment.find({
      barberId,
      date: normalizedDate,
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    const requestStart = timeStringToMinutes(time);
    const requestEnd = requestStart + totalDuration;

    if (isAdminRequest) {
      // Admin: allow any time — only block on overlap with existing appointments
      const hasOverlap = existingAppointments.some(appt => {
        const aStart = timeStringToMinutes(appt.time);
        const aEnd   = aStart + (appt.totalDuration || 30);
        return requestStart < aEnd && requestEnd > aStart;
      });
      if (hasOverlap) {
        return res.status(409).json({ message: 'Selected time overlaps with an existing appointment' });
      }
    } else {
      // Public booking: must land on a pre-generated 30-min boundary slot
      const validTimes = buildDailyAvailability(availableSlots, existingAppointments, totalDuration);
      if (!validTimes.includes(time)) {
        return res.status(409).json({
          message: 'Selected time slot is no longer available',
          availableTimes: validTimes,
          requestedTime: time
        });
      }
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

    // Automatically confirm appointments when slot is free
    // Only use pending if explicitly requested (for admin override scenarios)
    const initialStatus = requestedStatus === 'pending' ? 'pending' : 'confirmed';

    // Ensure customer record exists (only when customer info is provided)
    let customer = null;
    if (customerId) {
      customer = await Customer.findById(customerId);
    }

    if (!customer && customerName && customerPhone) {
      customer = await upsertCustomerFromAppointment({
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        notes,
        marketingOptIn,
        appointmentDate: normalizedDate
      });
    } else if (customer) {
      // Keep customer record fresh
      customer.name = customerName;
      customer.phone = customerPhone;
      customer.email = customerEmail;
      customer.notes = notes;
      customer.marketingOptIn = marketingOptIn ?? customer.marketingOptIn;
      customer.lastAppointmentDate = normalizedDate;
      await customer.save();
    }

    // Create appointment with immediate slot reservation
    const appointment = new Appointment({
      customer: customer?._id,
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
      status: initialStatus // Pending unless an admin creates a confirmed booking
    });

    const savedAppointment = await appointment.save();

    if (customer?._id) {
      const totalBookings = await Appointment.countDocuments({ customer: customer._id });
      await Customer.findByIdAndUpdate(customer._id, {
        totalBookings,
        $max: { lastAppointmentDate: normalizedDate }
      });
    }
    await savedAppointment.populate('services');
    await savedAppointment.populate('barberId');
    
    // Email handling
    const emailConfigured = EmailService.isConfigured();

    if (initialStatus === 'confirmed' && emailConfigured) {
      try {
        // Send confirmation to customer
        if (customerEmail) {
          await emailScheduler.scheduleEmail(
            savedAppointment._id,
            'confirmation',
            customerEmail,
            customerName,
            new Date()
          );
        }

        // Notify barber of confirmed booking
        const barber = await require('../models/Barber').findById(barberId);
        if (barber?.email) {
          await emailScheduler.scheduleEmail(
            savedAppointment._id,
            'booking_confirmed_to_barber',
            barber.email,
            barber.name,
            new Date()
          );
        }

        // Schedule reminders for both parties
        await emailScheduler.schedule30MinReminders(savedAppointment);
      } catch (emailError) {
        console.error('Failed to schedule confirmed booking emails:', emailError);
      }
    } else {
      // Treat as pending flow (customer initiated)
      console.log('Email configuration check:', {
        isConfigured: emailConfigured,
        customerEmail: customerEmail,
        resendApiKey: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.FROM_EMAIL
      });
      
      if (customerEmail && emailConfigured) {
        try {
          console.log('Attempting to schedule customer booking email...');
          await emailScheduler.scheduleEmail(
            savedAppointment._id,
            'booking_received',
            customerEmail,
            customerName,
            new Date() // Send immediately
          );
          console.log('Customer booking email scheduled successfully');
        } catch (emailError) {
          console.error('Failed to schedule customer booking email:', emailError);
        }
      } else {
        console.log('Skipping customer email:', {
          hasEmail: !!customerEmail,
          isConfigured: emailConfigured
        });
      }
      
      // 2. Send new booking notification to barber
      if (emailConfigured) {
        try {
          console.log('Attempting to schedule barber notification email...');
          const barber = await require('../models/Barber').findById(barberId);
          console.log('Barber found:', {
            id: barber?._id,
            name: barber?.name,
            email: barber?.email
          });
          
          if (barber?.email) {
            await emailScheduler.scheduleEmail(
              savedAppointment._id,
              'new_booking_to_barber',
              barber.email,
              barber.name,
              new Date() // Send immediately
            );
            console.log('Barber notification email scheduled successfully');
          } else {
            console.log('Barber email not found - skipping barber notification');
          }
        } catch (emailError) {
          console.error('Failed to schedule barber notification email:', emailError);
        }
      } else {
        console.log('Email service not configured - skipping barber notification');
      }
    }
    
    res.status(201).json({
      ...savedAppointment.toObject(),
      message: initialStatus === 'confirmed'
        ? 'Appointment booked and confirmed successfully.'
        : 'Appointment request submitted successfully. You will receive confirmation once approved.'
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
  console.log('\n\n🔄 APPOINTMENT UPDATE REQUEST RECEIVED');
  console.log('Appointment ID:', req.params.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    const { sendEmail, responseMessage, timeChangeMessage, ...update } = req.body;
    
    // Email is optional, no validation needed
    
    // Get the current appointment
    const currentAppointment = await Appointment.findById(req.params.id)
      .populate('barberId')
      .populate('services');
    
    if (!currentAppointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Handle status changes with slot validation
    if (update.status && update.status !== currentAppointment.status) {
      console.log('\n=== APPOINTMENT STATUS UPDATE ===');
      console.log('Appointment ID:', req.params.id);
      console.log('Current Status:', currentAppointment.status);
      console.log('New Status:', update.status);
      console.log('Customer:', currentAppointment.customerName);
      console.log('Date/Time:', currentAppointment.date.toISOString().split('T')[0], 'at', currentAppointment.time);
      
      if (update.status === 'confirmed') {
        console.log('\n🔍 STARTING CONFLICT DETECTION...');
        
        // Check for double booking when confirming - only check OTHER confirmed appointments
        const currentStartMinutes = timeStringToMinutes(currentAppointment.time);
        const currentEndMinutes = currentStartMinutes + currentAppointment.totalDuration;
        
        console.log('Current appointment time range:', {
          startTime: currentAppointment.time,
          endTime: minutesToTimeString(currentEndMinutes),
          duration: currentAppointment.totalDuration,
          startMinutes: currentStartMinutes,
          endMinutes: currentEndMinutes
        });
        
        const conflictingAppointments = await Appointment.find({
          _id: { $ne: req.params.id }, // Exclude current appointment
          barberId: currentAppointment.barberId._id || currentAppointment.barberId,
          date: currentAppointment.date,
          status: 'confirmed' // Only check OTHER confirmed appointments
        });
        
        console.log('\n📋 CONFLICT CHECK QUERY RESULTS:');
        console.log('- Excluding appointment ID:', req.params.id);
        console.log('- Barber ID:', currentAppointment.barberId._id || currentAppointment.barberId);
        console.log('- Date:', currentAppointment.date.toISOString().split('T')[0]);
        console.log('- Status filter: confirmed');
        console.log('- Found', conflictingAppointments.length, 'other confirmed appointments');
        
        // Only check if there are other confirmed appointments
        if (conflictingAppointments.length > 0) {
          console.log('\n📝 EXISTING CONFIRMED APPOINTMENTS:');
          // Log all existing confirmed appointments
          conflictingAppointments.forEach((apt, index) => {
            const aptStartMinutes = timeStringToMinutes(apt.time);
            const aptEndMinutes = aptStartMinutes + apt.totalDuration;
            const overlaps = currentStartMinutes < aptEndMinutes && currentEndMinutes > aptStartMinutes;
            
            console.log(`${index + 1}. ${apt.customerName}:`, {
              id: apt._id.toString(),
              time: apt.time,
              duration: apt.totalDuration,
              timeRange: `${apt.time} - ${minutesToTimeString(aptEndMinutes)}`,
              startMinutes: aptStartMinutes,
              endMinutes: aptEndMinutes,
              overlapsWithCurrent: overlaps
            });
          });
          
          // Check for actual time overlaps
          const hasConflict = conflictingAppointments.some(apt => {
            const aptStartMinutes = timeStringToMinutes(apt.time);
            const aptEndMinutes = aptStartMinutes + apt.totalDuration;
            
            // Check if there's any overlap
            return currentStartMinutes < aptEndMinutes && currentEndMinutes > aptStartMinutes;
          });
          
          console.log('\n⚖️ OVERLAP ANALYSIS:');
          console.log('Current:', currentStartMinutes, '-', currentEndMinutes, 'minutes');
          conflictingAppointments.forEach((apt, index) => {
            const aptStartMinutes = timeStringToMinutes(apt.time);
            const aptEndMinutes = aptStartMinutes + apt.totalDuration;
            const overlaps = currentStartMinutes < aptEndMinutes && currentEndMinutes > aptStartMinutes;
            console.log(`Existing ${index + 1}:`, aptStartMinutes, '-', aptEndMinutes, 'minutes', overlaps ? '❌ OVERLAPS' : '✅ NO OVERLAP');
          });
          
          console.log('\n🎯 FINAL CONFLICT RESULT:', hasConflict ? '❌ CONFLICT DETECTED' : '✅ NO CONFLICT');
          
          if (hasConflict) {
            const conflictDetails = conflictingAppointments.filter(apt => {
              const aptStartMinutes = timeStringToMinutes(apt.time);
              const aptEndMinutes = aptStartMinutes + apt.totalDuration;
              return currentStartMinutes < aptEndMinutes && currentEndMinutes > aptStartMinutes;
            });
            
            console.log('\n🚨 CONFLICTING APPOINTMENTS:', conflictDetails.map(apt => ({
              customer: apt.customerName,
              time: apt.time,
              duration: apt.totalDuration
            })));
            
            console.log('\n❌ RETURNING 409 CONFLICT ERROR');
            
            return res.status(409).json({ 
              message: 'Time slot conflict detected! This slot is no longer available.',
              conflictingAppointments: conflictDetails.map(apt => ({
                id: apt._id,
                customerName: apt.customerName,
                time: apt.time,
                duration: apt.totalDuration
              }))
            });
          }
        } else {
          console.log('\n✅ NO OTHER CONFIRMED APPOINTMENTS - Proceeding with confirmation');
        }
        
        console.log('\n🔍 CONFLICT DETECTION COMPLETE - No conflicts found');
      }
    }

    if (update.date) {
      update.date = normalizeDate(update.date);
    }

    // Validate time update if time is being changed
    let oldTime = null;
    if (update.time && update.time !== currentAppointment.time) {
      oldTime = currentAppointment.time;
      const appointmentDate = update.date ? normalizeDate(update.date) : currentAppointment.date;
      const dayOfWeek = appointmentDate.getDay();
      
      // Get working hours for the day
      const timeSlots = await TimeSlot.find({
        barberId: currentAppointment.barberId._id || currentAppointment.barberId,
        dayOfWeek,
        isAvailable: true
      });

      if (!timeSlots.length) {
        return res.status(400).json({ message: 'No working hours configured for this day' });
      }

      // Get all appointments for the day, excluding the current appointment
      const existingAppointments = await Appointment.find({
        _id: { $ne: req.params.id }, // Exclude current appointment
        barberId: currentAppointment.barberId._id || currentAppointment.barberId,
        date: appointmentDate,
        status: { $in: ['pending', 'confirmed', 'completed'] }
      });

      // Check if new time is available
      const availableTimes = buildDailyAvailability(timeSlots, existingAppointments, currentAppointment.totalDuration);
      
      if (!availableTimes.includes(update.time)) {
        return res.status(409).json({ 
          message: 'Selected time slot is not available',
          availableTimes,
          requestedTime: update.time
        });
      }
    }

    // Add response message if provided
    if (responseMessage) {
      update.responseMessage = responseMessage;
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('barberId')
      .populate('services');

    // Sync customer record when contact details change
    if (appointment && (update.customerName || update.customerPhone || update.customerEmail)) {
      const syncedCustomer = await upsertCustomerFromAppointment({
        name: appointment.customerName,
        phone: appointment.customerPhone,
        email: appointment.customerEmail,
        notes: appointment.notes,
        marketingOptIn: appointment.marketingOptIn,
        appointmentDate: appointment.date
      });

      if (syncedCustomer && (!appointment.customer || appointment.customer.toString() !== syncedCustomer._id.toString())) {
        appointment.customer = syncedCustomer._id;
        await appointment.save();
      }
    }

    // Send time change emails if time was changed
    if (oldTime && sendEmail && EmailService.isConfigured()) {
      try {
        // Send to customer
        if (appointment.customerEmail) {
          await EmailService.sendTimeChangeToCustomer(
            appointment,
            appointment.barberId,
            oldTime,
            timeChangeMessage || ''
          );
        }

        // Send to barber
        if (appointment.barberId?.email) {
          await EmailService.sendTimeChangeToBarber(
            appointment,
            appointment.barberId,
            oldTime,
            timeChangeMessage || ''
          );
        }
      } catch (emailError) {
        console.error('Failed to send time change emails:', emailError);
        // Don't fail the update if email fails
      }
    }
    
    // Handle email notifications and scheduling only if email service is configured
    if (sendEmail && EmailService.isConfigured()) {
      try {
        if (appointment.status === 'confirmed') {
          // 3. Send confirmation email to customer
          if (appointment.customerEmail) {
            await emailScheduler.scheduleEmail(
              appointment._id,
              'confirmation',
              appointment.customerEmail,
              appointment.customerName,
              new Date() // Send immediately
            );
          }
          
          // 4. Send booking confirmed notification to barber
          if (appointment.barberId?.email) {
            await emailScheduler.scheduleEmail(
              appointment._id,
              'booking_confirmed_to_barber',
              appointment.barberId.email,
              appointment.barberId.name,
              new Date() // Send immediately
            );
          }
          
          // 5. Schedule 30-minute reminders for both customer and barber
          await emailScheduler.schedule30MinReminders(appointment);
          
        } else if (appointment.status === 'cancelled') {
          // Send rejection email to customer
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
          
        } else if (appointment.status === 'completed') {
          // 7. Send completion emails to both customer and barber
          if (appointment.customerEmail) {
            await emailScheduler.scheduleEmail(
              appointment._id,
              'completion_to_customer',
              appointment.customerEmail,
              appointment.customerName,
              new Date() // Send immediately
            );
          }
          
          if (appointment.barberId?.email) {
            await emailScheduler.scheduleEmail(
              appointment._id,
              'completion_to_barber',
              appointment.barberId.email,
              appointment.barberId.name,
              new Date() // Send immediately
            );
          }
        }
      } catch (emailError) {
        console.error('Email scheduling failed:', emailError);
        // Don't fail the request if email scheduling fails
      }
    } else if (sendEmail && !EmailService.isConfigured()) {
      console.log('Email service not configured - skipping email notifications');
    }
    
    console.log('\n✅ APPOINTMENT UPDATE SUCCESSFUL');
    console.log('Final appointment status:', appointment.status);
    console.log('Customer:', appointment.customerName);
    console.log('=== END APPOINTMENT UPDATE ===\n');
    
    res.json(appointment);
  } catch (error) {
    console.log('\n❌ APPOINTMENT UPDATE ERROR');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.log('Request ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('=== END ERROR LOG ===\n');
    
    res.status(400).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Cancel any scheduled email notifications before deleting
    try {
      await emailScheduler.cancelAppointmentEmails(appointment._id);
    } catch (emailError) {
      console.error('Failed to cancel scheduled emails for deleted appointment:', emailError);
    }

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
      status: { $in: ['pending', 'confirmed', 'completed'] }
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
    
    console.log('Slot validation request:', {
      barberId,
      date,
      time,
      duration,
      body: req.body
    });
    
    if (!barberId || !date || !time || !duration) {
      console.error('Missing required fields for slot validation:', { barberId, date, time, duration });
      return res.status(400).json({ 
        message: 'All fields are required',
        required: ['barberId', 'date', 'time', 'duration'],
        received: { barberId, date, time, duration }
      });
    }

    const normalizedDate = normalizeDate(date);
    const today = getGermanToday();
    
    // Prevent validation for past dates (using German timezone)
    if (normalizedDate < today) {
      return res.json({ 
        available: false,
        reason: 'Cannot book appointments for past dates'
      });
    }

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
      status: { $in: ['pending', 'confirmed', 'completed'] }
    });

    const availableTimes = buildDailyAvailability(timeSlots, appointments, parseInt(duration));
    const isAvailable = availableTimes.includes(time);
    
    console.log('Slot validation result:', {
      isAvailable,
      requestedTime: time,
      availableTimesCount: availableTimes.length
    });
    
    res.json({ 
      available: isAvailable,
      reason: isAvailable ? 'Slot is available' : 'Slot is already booked or outside working hours',
      alternativeTimes: isAvailable ? [] : availableTimes.slice(0, 5) // Suggest 5 alternatives
    });
  } catch (error) {
    console.error('Slot validation error:', {
      error: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({ 
      message: 'Error validating slot',
      error: error.message
    });
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
    
    if (!EmailService.isConfigured()) {
      return res.json({ message: 'Email service not configured - reminders disabled' });
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

// Test email endpoint
router.post('/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    console.log('Testing email configuration...');
    console.log('Environment variables:', {
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      FROM_EMAIL: process.env.FROM_EMAIL,
      FROM_NAME: process.env.FROM_NAME
    });
    
    if (!EmailService.isConfigured()) {
      return res.status(400).json({ 
        message: 'Email service not configured',
        config: {
          hasApiKey: !!process.env.RESEND_API_KEY,
          fromEmail: process.env.FROM_EMAIL
        }
      });
    }
    
    // Create a test appointment object
    const testAppointment = {
      customerName: 'Test Customer',
      customerEmail: email,
      date: new Date(),
      time: '10:00',
      totalPrice: 35,
      services: [{ name: 'Test Service' }]
    };
    
    const testBarber = {
      name: 'Test Barber',
      email: 'test@example.com'
    };
    
    await EmailService.sendBookingReceived(testAppointment, testBarber);
    
    res.json({ 
      message: 'Test email sent successfully',
      sentTo: email,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      message: 'Failed to send test email',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
