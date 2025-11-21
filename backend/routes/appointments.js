const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Service = require('../models/Service');
const TimeSlot = require('../models/TimeSlot');

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

    for (let start = startMinutes; start + duration <= endMinutes; start += 15) {
      const end = start + duration;
      const overlaps = appointments.some(appt => {
        const apptStart = timeStringToMinutes(appt.time);
        const apptEnd = apptStart + (appt.totalDuration || 0);
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

// Get availability for a given date/barber/duration
router.get('/availability', async (req, res) => {
  try {
    const { barberId, date, duration } = req.query;
    if (!barberId || !date || !duration) {
      return res.status(400).json({ message: 'barberId, date, and duration are required' });
    }

    const normalizedDate = normalizeDate(date);
    const dayOfWeek = normalizedDate.getDay();

    const timeSlots = await TimeSlot.find({
      barberId,
      dayOfWeek,
      isAvailable: true
    });

    const appointments = await Appointment.find({
      barberId,
      date: normalizedDate
    });

    const availableTimes = buildDailyAvailability(timeSlots, appointments, parseInt(duration, 10));
    res.json({ availableTimes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create appointment
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
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const normalizedDate = normalizeDate(date);
    const serviceDocs = await Service.find({ _id: { $in: services } });

    if (!serviceDocs.length || serviceDocs.length !== services.length) {
      return res.status(400).json({ message: 'Invalid services selection' });
    }

    const totalPrice = serviceDocs.reduce((sum, s) => sum + s.price, 0);
    const totalDuration = serviceDocs.reduce((sum, s) => sum + s.duration, 0);

    const dayOfWeek = normalizedDate.getDay();
    const availableSlots = await TimeSlot.find({ barberId, dayOfWeek, isAvailable: true });

    if (!availableSlots.length) {
      return res.status(400).json({ message: 'No working hours configured for this day' });
    }

    const sameDayAppointments = await Appointment.find({ barberId, date: normalizedDate });
    const validTimes = buildDailyAvailability(availableSlots, sameDayAppointments, totalDuration);

    if (!validTimes.includes(time)) {
      return res.status(409).json({ message: 'Selected time slot is no longer available' });
    }

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
      marketingOptIn
    });

    const savedAppointment = await appointment.save();
    const populated = await savedAppointment.populate('services').populate('barberId');
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Time slot already booked' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const update = { ...req.body };

    if (update.date) {
      update.date = normalizeDate(update.date);
    }

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('barberId')
      .populate('services');
    res.json(appointment);
  } catch (error) {
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

module.exports = router;
