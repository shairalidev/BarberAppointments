const express = require('express');
const router = express.Router();
const Restriction = require('../models/Restriction');

// Get all restrictions
router.get('/', async (req, res) => {
  try {
    const restrictions = await Restriction.find().sort({ date: 1 });
    res.json(restrictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add restriction
router.post('/', async (req, res) => {
  try {
    const restriction = new Restriction(req.body);
    const saved = await restriction.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete restriction
router.delete('/:id', async (req, res) => {
  try {
    await Restriction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restriction removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
