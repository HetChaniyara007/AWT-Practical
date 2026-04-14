const router = require('express').Router();
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { protect, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ── GET /api/events — Public list (approved only) ────────
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 12, club } = req.query;
    const query = { status: 'approved' };

    if (search) query.title = { $regex: search, $options: 'i' };
    if (category && category !== 'all') query.category = category;
    if (club) query.club = club;

    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(query)
        .populate('club', 'name logo')
        .populate('createdBy', 'name')
        .sort({ startDateTime: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Event.countDocuments(query),
    ]);

    res.json({ events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch events.', error: err.message });
  }
});

// ── GET /api/events/upcoming — Featured upcoming events ──
router.get('/upcoming', async (req, res) => {
  try {
    const events = await Event.find({
      status: 'approved',
      startDateTime: { $gte: new Date() },
    })
      .populate('club', 'name logo')
      .sort({ startDateTime: 1 })
      .limit(6);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch upcoming events.', error: err.message });
  }
});

// ── GET /api/events/:id ───────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('club', 'name logo description')
      .populate('createdBy', 'name email')
      .populate('approvedBy', 'name');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch event.', error: err.message });
  }
});

// ── POST /api/events — Club admin creates event ──────────
router.post('/', protect, requireRole('club_admin'), upload.single('banner'), async (req, res) => {
  try {
    const {
      title, description, venue, startDateTime, endDateTime,
      capacity, registrationDeadline, tags, category,
    } = req.body;

    if (!title || !description || !venue || !startDateTime || !endDateTime || !capacity || !registrationDeadline) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const clubId = req.user.clubRef?._id || req.user.clubRef;
    if (!clubId) return res.status(400).json({ message: 'Club admin is not assigned to a club.' });

    const banner = req.file ? `/uploads/${req.file.filename}` : '';

    const event = await Event.create({
      title,
      description,
      club: clubId,
      createdBy: req.user._id,
      banner,
      venue,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      capacity: Number(capacity),
      registrationDeadline: new Date(registrationDeadline),
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim())) : [],
      category: category || 'other',
      status: 'pending',
    });

    // Notify all superadmins
    const User = require('../models/User');
    const admins = await User.find({ role: 'superadmin' });
    const io = req.app.get('io');
    for (const admin of admins) {
      const notif = await Notification.create({
        recipient: admin._id,
        type: 'system',
        title: 'New Event Pending Approval',
        message: `"${title}" submitted by ${req.user.name} requires your review.`,
        link: `/admin/approvals`,
      });
      io.to(admin._id.toString()).emit('notification:new', notif);
    }

    const populated = await event.populate('club', 'name logo');
    res.status(201).json({ event: populated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create event.', error: err.message });
  }
});

// ── PUT /api/events/:id — Club admin edits own pending event
router.put('/:id', protect, requireRole('club_admin'), upload.single('banner'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own events.' });
    }
    if (!['draft', 'pending', 'rejected'].includes(event.status)) {
      return res.status(400).json({ message: 'Only draft, pending, or rejected events can be edited.' });
    }

    const updatableFields = [
      'title', 'description', 'venue', 'startDateTime', 'endDateTime',
      'capacity', 'registrationDeadline', 'tags', 'category',
    ];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    if (req.file) event.banner = `/uploads/${req.file.filename}`;
    event.status = 'pending'; // re-submit for approval
    await event.save();

    res.json({ event });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event.', error: err.message });
  }
});

// ── DELETE /api/events/:id — Club admin cancels own event ─
router.delete('/:id', protect, requireRole('club_admin', 'superadmin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    if (req.user.role === 'club_admin' && event.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    event.status = 'cancelled';
    await event.save();
    res.json({ message: 'Event cancelled.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to cancel event.', error: err.message });
  }
});

// ── GET /api/events/club/mine — Club admin's own events ──
router.get('/club/mine', protect, requireRole('club_admin'), async (req, res) => {
  try {
    const clubId = req.user.clubRef?._id || req.user.clubRef;
    const events = await Event.find({ club: clubId })
      .populate('club', 'name logo')
      .sort({ createdAt: -1 });
    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch club events.', error: err.message });
  }
});

module.exports = router;
