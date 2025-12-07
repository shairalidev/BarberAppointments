const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://barberappointment.duckdns.org'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Public routes (no auth required) - MUST BE BEFORE PROTECTED ROUTES
app.get('/api/services/public', async (req, res) => {
  try {
    const Service = require('./models/Service');
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/barbers/public', async (req, res) => {
  try {
    const Barber = require('./models/Barber');
    const barbers = await Barber.find({ available: true });
    res.json(barbers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Routes
const { router: authRouter, verifyToken } = require('./routes/auth');
app.use('/api/auth', authRouter);
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/barbers', verifyToken, require('./routes/barbers'));
app.use('/api/services', verifyToken, require('./routes/services'));
app.use('/api/timeslots', verifyToken, require('./routes/timeslots'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});