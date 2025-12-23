const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const emailScheduler = require('./services/emailScheduler');
const { install: installSafeConsole } = require('./utils/safeConsole');
require('dotenv').config();

// Install safe console to handle emojis
installSafeConsole();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://ates-barberos.com', 'https://www.ates-barberos.com', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

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
app.use('/api/restrictions', verifyToken, require('./routes/restrictions'));

// Global error handler - must be after all routes
app.use((error, req, res, next) => {
  console.error('Global error handler:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });
  
  // Always return JSON error responses
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// Handle 404 errors with JSON response
app.use('*', (req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/auth',
      '/api/appointments',
      '/api/barbers',
      '/api/services',
      '/api/timeslots',
      '/api/restrictions'
    ]
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start email scheduler
  emailScheduler.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  emailScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  emailScheduler.stop();
  process.exit(0);
});