const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  dayOfWeek: { type: Number, required: true }, // 0-6 (Sunday-Saturday)
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  isAvailable: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('TimeSlot', timeSlotSchema);