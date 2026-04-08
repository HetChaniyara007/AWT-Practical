import mongoose from 'mongoose';

const waitlistSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  joined_at: { type: Date, default: Date.now },
});

// Compound index to prevent duplicate waitlist entries
waitlistSchema.index({ user_id: 1, event_id: 1 }, { unique: true });

export default mongoose.model('Waitlist', waitlistSchema);
