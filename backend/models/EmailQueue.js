const mongoose = require('mongoose');

const emailQueueSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  emailType: {
    type: String,
    enum: [
      'booking_received',
      'new_booking_to_barber',
      'confirmation',
      'booking_confirmed_to_barber',
      'customer_30min_reminder',
      'barber_30min_reminder',
      'completion_to_customer',
      'completion_to_barber',
      'rejection',
      'reminder' // legacy support
    ],
    required: true
  },
  recipientEmail: { type: String, required: true },
  recipientName: { type: String, required: true },
  scheduledFor: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'sent', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  lastAttempt: { type: Date },
  errorMessage: { type: String },
  sentAt: { type: Date }
}, { timestamps: true });

// Index for efficient querying
emailQueueSchema.index({ scheduledFor: 1, status: 1 });
emailQueueSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('EmailQueue', emailQueueSchema);
