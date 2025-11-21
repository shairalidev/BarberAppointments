const mongoose = require('mongoose');

const barberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialties: [{ type: String }],
  available: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Barber', barberSchema);