const express = require('express');
const router = express.Router();
const Barber = require('../models/Barber');

// Get all barbers
router.get('/', async (req, res) => {
  try {
    const barbers = await Barber.find();
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create barber
router.post('/', async (req, res) => {
  try {
    const barber = new Barber(req.body);
    const savedBarber = await barber.save();
    res.status(201).json(savedBarber);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update barber
router.put('/:id', async (req, res) => {
  try {
    const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(barber);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;