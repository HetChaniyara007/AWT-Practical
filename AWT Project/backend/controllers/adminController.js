import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();

    // Registrations per month generic grouping (Mock representation for frontend chart)
    const recentRegistrations = await Registration.aggregate([
      { $match: { status: 'confirmed' } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$registered_at" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    res.json({
      totalUsers,
      totalEvents,
      totalRegistrations,
      recentRegistrations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password_hash');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
