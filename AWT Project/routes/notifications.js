const router = require('express').Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// ── GET /api/notifications — User's notifications ─────────
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications.', error: err.message });
  }
});

// ── PUT /api/notifications/:id/read — Mark one as read ───
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Notification not found.' });
    res.json({ notification: notif });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification.', error: err.message });
  }
});

// ── PUT /api/notifications/read-all — Mark all as read ───
router.put('/read-all/mark', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notifications.', error: err.message });
  }
});

// ── DELETE /api/notifications/:id ─────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id });
    res.json({ message: 'Notification deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification.', error: err.message });
  }
});

module.exports = router;
