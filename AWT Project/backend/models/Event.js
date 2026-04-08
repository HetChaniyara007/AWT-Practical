import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    banner_url: { type: String },
    category: {
      type: String,
      enum: ['cultural', 'technical', 'sports', 'workshop', 'other'],
      required: true,
    },
    tags: [{ type: String }],
    venue: { type: String, required: true },
    start_datetime: { type: Date, required: true },
    end_datetime: { type: Date, required: true },
    registration_deadline: { type: Date, required: true },
    max_capacity: { type: Number, required: true },
    current_registrations: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
      default: 'published',
    },
    is_paid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    club_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Club' },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('Event', eventSchema);
