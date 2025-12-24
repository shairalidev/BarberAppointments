const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  notes: { type: String },
  totalBookings: { type: Number, default: 0 },
  lastAppointmentDate: { type: Date },
  marketingOptIn: { type: Boolean, default: true }
}, { timestamps: true });

customerSchema.index({ name: 'text', phone: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
