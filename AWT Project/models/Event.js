const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    banner: { type: String, default: '' },
    venue: { type: String, required: true, trim: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    registrationDeadline: { type: Date, required: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: '' },
    tags: [{ type: String, trim: true }],
    registrationCount: { type: Number, default: 0 },
    category: {
      type: String,
      enum: ['technical', 'cultural', 'sports', 'workshop', 'seminar', 'other'],
      default: 'other',
    },
  },
  { timestamps: true }
);

// Virtual: is registration open?
eventSchema.virtual('isRegistrationOpen').get(function () {
  const now = new Date();
  return (
    this.status === 'approved' &&
    now <= this.registrationDeadline &&
    this.registrationCount < this.capacity
  );
});

eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
