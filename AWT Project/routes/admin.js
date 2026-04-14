const router = require('express').Router();
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Club = require('../models/Club');
const Notification = require('../models/Notification');
const { protect, requireRole } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/email');

// ── GET /api/admin/events/pending — Approval queue ────────
router.get('/events/pending', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const events = await Event.find({ status: 'pending' })
      .populate('club', 'name logo')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending events.', error: err.message });
  }
});

// ── GET /api/admin/events — All events ────────────────────
router.get('/events', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('club', 'name logo')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Event.countDocuments(query),
    ]);
    res.json({ events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events.', error: err.message });
  }
});

// ── PUT /api/admin/events/:id/approve ──────────────────────
router.put('/events/:id/approve', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name')
      .populate('createdBy', 'name email');

    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending events can be approved.' });
    }

    event.status = 'approved';
    event.approvedBy = req.user._id;
    event.approvedAt = new Date();
    event.rejectionReason = '';
    await event.save();

    // Notify club admin
    const clubAdmin = await User.findOne({ role: 'club_admin', clubRef: event.club._id });
    if (clubAdmin) {
      const notif = await Notification.create({
        recipient: clubAdmin._id,
        type: 'event_approved',
        title: 'Event Approved!',
        message: `Your event "${event.title}" has been approved and is now live.`,
        link: `/club/events`,
      });
      const io = req.app.get('io');
      io.to(clubAdmin._id.toString()).emit('notification:new', notif);
      io.to('admin_room').emit('event:approved', { eventId: event._id, title: event.title });

      // Mock email
      const { subject, html } = emailTemplates.eventApproved(
        clubAdmin.name,
        event.title,
        event.startDateTime.toLocaleDateString()
      );
      await sendEmail({ to: clubAdmin.email, subject, html });
    }

    res.json({ event, message: 'Event approved successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Approval failed.', error: err.message });
  }
});

// ── PUT /api/admin/events/:id/reject ──────────────────────
router.put('/events/:id/reject', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Rejection reason is required.' });

    const event = await Event.findById(req.params.id)
      .populate('club', 'name')
      .populate('createdBy', 'name email');

    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending events can be rejected.' });
    }

    event.status = 'rejected';
    event.rejectionReason = reason;
    await event.save();

    // Notify club admin
    const clubAdmin = await User.findOne({ role: 'club_admin', clubRef: event.club._id });
    if (clubAdmin) {
      const notif = await Notification.create({
        recipient: clubAdmin._id,
        type: 'event_rejected',
        title: 'Event Rejected',
        message: `Your event "${event.title}" was rejected. Reason: ${reason}`,
        link: `/club/events`,
      });
      const io = req.app.get('io');
      io.to(clubAdmin._id.toString()).emit('notification:new', notif);

      const { subject, html } = emailTemplates.eventRejected(clubAdmin.name, event.title, reason);
      await sendEmail({ to: clubAdmin.email, subject, html });
    }

    res.json({ event, message: 'Event rejected.' });
  } catch (err) {
    res.status(500).json({ message: 'Rejection failed.', error: err.message });
  }
});

// ── GET /api/admin/analytics — Dashboard stats ─────────────
router.get('/analytics', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const [
      totalEvents, totalUsers, totalRegistrations, totalClubs,
      eventsByStatus, registrationsByMonth, topEvents, categoryDistribution,
    ] = await Promise.all([
      Event.countDocuments(),
      User.countDocuments({ role: 'student' }),
      Registration.countDocuments(),
      Club.countDocuments({ isActive: true }),

      // Events grouped by status
      Event.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      // Registrations by month (last 6 months)
      Registration.aggregate([
        {
          $match: {
            registeredAt: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$registeredAt' },
              month: { $month: '$registeredAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Top 5 events by registration
      Event.find({ status: 'approved' })
        .populate('club', 'name')
        .sort({ registrationCount: -1 })
        .limit(5)
        .select('title registrationCount capacity club'),

      // Category distribution
      Event.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = {};
    eventsByStatus.forEach((s) => { statusMap[s._id] = s.count; });

    res.json({
      overview: { totalEvents, totalUsers, totalRegistrations, totalClubs },
      eventsByStatus: statusMap,
      registrationsByMonth,
      topEvents,
      categoryDistribution,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics.', error: err.message });
  }
});

// ── GET /api/admin/users ───────────────────────────────────
router.get('/users', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = role ? { role } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .populate('clubRef', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);
    res.json({ users, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users.', error: err.message });
  }
});

// ── PUT /api/admin/users/:id/toggle — Activate/deactivate user
router.put('/users/:id/toggle', protect, requireRole('superadmin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ user, message: `User ${user.isActive ? 'activated' : 'deactivated'}.` });
  } catch (err) {
    res.status(500).json({ message: 'Toggle failed.', error: err.message });
  }
});

module.exports = router;
