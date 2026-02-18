const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  // customerName/Phone are not required for admin block appointments (isBlock: true)
  customerName: { type: String, required: function() { return !this.isBlock; } },
  customerPhone: { type: String, required: function() { return !this.isBlock; } },
  customerEmail: { type: String },
  notes: { type: String },
  marketingOptIn: { type: Boolean, default: true },
  barberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Barber', required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
  totalPrice: { type: Number, default: 0 },
  totalDuration: { type: Number, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  endTime: { type: String },   // explicit end time, used by block appointments
  isBlock: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  responseMessage: { type: String }
}, { timestamps: true });

appointmentSchema.index({ barberId: 1, date: 1, time: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
