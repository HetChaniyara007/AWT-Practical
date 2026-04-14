const mongoose = require('mongoose');
const crypto = require('crypto');

const registrationSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    qrToken: {
      type: String,
      unique: true,
      default: () => crypto.randomUUID(),
    },
    checkedIn: { type: Boolean, default: false },
    checkedInAt: { type: Date, default: null },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique constraint: one registration per student per event
registrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
