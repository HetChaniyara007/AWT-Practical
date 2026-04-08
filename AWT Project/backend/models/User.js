import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password_hash: { type: String, required: true },
    roll_number: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    year: { type: Number, required: true },
    role: {
      type: String,
      enum: ['student', 'club_admin', 'super_admin'],
      default: 'student',
    },
    is_verified: { type: Boolean, default: false },
    profile_pic_url: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('User', userSchema);
