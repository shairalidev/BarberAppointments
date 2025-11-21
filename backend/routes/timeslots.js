const express = require('express');
const router = express.Router();
const TimeSlot = require('../models/TimeSlot');

// Get time slots by barber and day
router.get('/', async (req, res) => {
  try {
    const { barberId, dayOfWeek } = req.query;
    const query = {};
    if (barberId) query.barberId = barberId;
    if (dayOfWeek !== undefined) query.dayOfWeek = dayOfWeek;
    
    const timeSlots = await TimeSlot.find(query).populate('barberId');
    res.json(timeSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create time slot
router.post('/', async (req, res) => {
  try {
    const timeSlot = new TimeSlot(req.body);
    const savedTimeSlot = await timeSlot.save();
    res.status(201).json(savedTimeSlot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update time slot
router.put('/:id', async (req, res) => {
  try {
    const timeSlot = await TimeSlot.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(timeSlot);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete time slot
router.delete('/:id', async (req, res) => {
  try {
    await TimeSlot.findByIdAndDelete(req.params.id);
    res.json({ message: 'Time slot deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;