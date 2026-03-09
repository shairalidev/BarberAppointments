const mongoose = require('mongoose');

const emailOptOutSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ['bounced', 'complained', 'manual'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailOptOut', emailOptOutSchema);
