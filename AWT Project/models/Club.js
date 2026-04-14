const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '', trim: true },
    logo: { type: String, default: '' },
    adminUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    tags: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
    foundedYear: { type: Number, default: new Date().getFullYear() },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Club', clubSchema);
