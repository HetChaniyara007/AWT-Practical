import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  ticket_id: { type: String, required: true, unique: true },
  qr_code_url: { type: String },
  status: {
    type: String,
    enum: ['confirmed', 'waitlisted', 'cancelled'],
    default: 'confirmed',
  },
  attended: { type: Boolean, default: false },
  registered_at: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ user_id: 1, event_id: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
