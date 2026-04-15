const router = require('express').Router();
const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { protect, requireRole } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/email');

// ── POST /api/registrations — Student registers for event ─
router.post('/', protect, requireRole('student'), async (req, res) => {
  try {
    const { eventId } = req.body;
    if (!eventId) return res.status(400).json({ message: 'Event ID is required.' });

    const event = await Event.findById(eventId).populate('club', 'name');
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.status !== 'approved') return res.status(400).json({ message: 'This event is not open for registration.' });

    const now = new Date();
    if (now > event.registrationDeadline) {
      return res.status(400).json({ message: 'Registration deadline has passed.' });
    }
    if (event.registrationCount >= event.capacity) {
      return res.status(400).json({ message: 'This event is fully booked.' });
    }

    // Check duplicate
    const existing = await Registration.findOne({ event: eventId, student: req.user._id });
    if (existing) return res.status(409).json({ message: 'You are already registered for this event.' });

    const registration = await Registration.create({ event: eventId, student: req.user._id });

    // Increment count
    await Event.findByIdAndUpdate(eventId, { $inc: { registrationCount: 1 } });

    // In-app notification to student
    const studentNotif = await Notification.create({
      recipient: req.user._id,
      type: 'registration_confirmed',
      title: 'Registration Confirmed',
      message: `You are registered for "${event.title}".`,
      link: `/my-tickets`,
    });

    // In-app notification to club admin
    const clubAdmin = await require('../models/User').findOne({
      role: 'club_admin',
      clubRef: event.club._id,
    });
    if (clubAdmin) {
      const clubNotif = await Notification.create({
        recipient: clubAdmin._id,
        type: 'new_registration',
        title: 'New Registration',
        message: `${req.user.name} registered for "${event.title}".`,
        link: `/club/events/${eventId}/attendees`,
      });
      const io = req.app.get('io');
      io.to(clubAdmin._id.toString()).emit('notification:new', clubNotif);
      io.to('admin_room').emit('event:new_registration', { eventId, studentName: req.user.name });
    }

    const io = req.app.get('io');
    io.to(req.user._id.toString()).emit('notification:new', studentNotif);

    // Mock email
    const { subject, html } = emailTemplates.registrationConfirmed(
      req.user.name,
      event.title,
      registration.qrToken,
      event.startDateTime.toLocaleDateString()
    );
    await sendEmail({ to: req.user.email, subject, html });

    const populated = await registration.populate([
      { path: 'event', select: 'title startDateTime venue banner club', populate: { path: 'club', select: 'name logo' } },
      { path: 'student', select: 'name email enrollmentNo' },
    ]);

    res.status(201).json({ registration: populated });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'You are already registered for this event.' });
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

// ── GET /api/registrations/my — Student's registrations ──
router.get('/my', protect, requireRole('student'), async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user._id })
      .populate({
        path: 'event',
        select: 'title startDateTime endDateTime venue banner status club category',
        populate: { path: 'club', select: 'name logo' },
      })
      .sort({ registeredAt: -1 });
    res.json({ registrations });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations.', error: err.message });
  }
});

// ── GET /api/registrations/event/:id — Club admin attendee list
router.get('/event/:id', protect, requireRole('club_admin', 'superadmin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // Club admin can only view their own event's attendees
    if (req.user.role === 'club_admin') {
      const userClubId = req.user.clubRef?._id?.toString() || req.user.clubRef?.toString();
      if (event.club.toString() !== userClubId) {
        return res.status(403).json({ message: 'Access denied.' });
      }
    }

    const registrations = await Registration.find({ event: req.params.id })
      .populate('student', 'name email enrollmentNo')
      .sort({ registeredAt: -1 });

    res.json({ registrations, total: registrations.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch attendees.', error: err.message });
  }
});

// ── POST /api/registrations/checkin — QR scan check-in ───
router.post('/checkin', protect, requireRole('club_admin', 'superadmin'), async (req, res) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) return res.status(400).json({ message: 'QR token is required.' });

    const registration = await Registration.findOne({ qrToken })
      .populate('student', 'name email enrollmentNo')
      .populate({ path: 'event', select: 'title startDateTime venue club' });

    if (!registration) return res.status(404).json({ message: 'Invalid QR code. Registration not found.' });
    if (registration.checkedIn) {
      return res.status(400).json({
        message: 'Already checked in.',
        checkedInAt: registration.checkedInAt,
        student: registration.student,
      });
    }

    // Club admin can only check in for their own events
    if (req.user.role === 'club_admin') {
      const userClubId = req.user.clubRef?._id?.toString() || req.user.clubRef?.toString();
      if (registration.event.club.toString() !== userClubId) {
        return res.status(403).json({ message: 'This registration is not for your club.' });
      }
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to('admin_room').emit('checkin:update', {
      eventId: registration.event._id,
      studentName: registration.student.name,
    });

    res.json({
      message: 'Check-in successful!',
      student: registration.student,
      event: registration.event,
      checkedInAt: registration.checkedInAt,
    });
  } catch (err) {
    res.status(500).json({ message: 'Check-in failed.', error: err.message });
  }
});

// ── DELETE /api/registrations/:id — Student cancels registration
router.delete('/:id', protect, requireRole('student'), async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ message: 'Registration not found.' });
    if (reg.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied.' });
    }
    if (reg.checkedIn) return res.status(400).json({ message: 'Cannot cancel after check-in.' });

    await Registration.findByIdAndDelete(req.params.id);
    await Event.findByIdAndUpdate(reg.event, { $inc: { registrationCount: -1 } });

    res.json({ message: 'Registration cancelled.' });
  } catch (err) {
    res.status(500).json({ message: 'Cancellation failed.', error: err.message });
  }
});

module.exports = router;
