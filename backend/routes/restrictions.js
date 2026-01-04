const express = require('express');
const router = express.Router();
const Restriction = require('../models/Restriction');
const { normalizeDateToGerman } = require('../utils/timezoneHelper');

// Get all restrictions
router.get('/', async (req, res) => {
  try {
    const restrictions = await Restriction.find().sort({ date: 1 });
    res.json(restrictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if a specific date is restricted
router.get('/check/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const normalizedDate = normalizeDateToGerman(date);
    
    const restriction = await Restriction.findOne({ date: normalizedDate });
    res.json({ 
      isRestricted: !!restriction,
      restriction: restriction || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add restriction (off date)
router.post('/', async (req, res) => {
  try {
    const { date, reason } = req.body;
    
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    
    const normalizedDate = normalizeDateToGerman(date);
    
    // Check if restriction already exists
    const existing = await Restriction.findOne({ date: normalizedDate });
    if (existing) {
      return res.status(400).json({ message: 'This date is already marked as off' });
    }
    
    const restriction = new Restriction({
      date: normalizedDate,
      reason: reason || 'Off Date'
    });
    
    const saved = await restriction.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete restriction by date
router.delete('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const normalizedDate = normalizeDateToGerman(date);
    
    const restriction = await Restriction.findOneAndDelete({ date: normalizedDate });
    if (!restriction) {
      return res.status(404).json({ message: 'Restriction not found' });
    }
    res.json({ message: 'Restriction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete restriction by ID
router.delete('/:id', async (req, res) => {
  try {
    await Restriction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restriction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
