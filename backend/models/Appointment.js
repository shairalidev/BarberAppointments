const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  notes: { type: String },
  marketingOptIn: { type: Boolean, default: true },
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true }],
  totalPrice: { type: Number, required: true },
  totalDuration: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

appointmentSchema.index({ barberId: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
