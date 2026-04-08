import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Waitlist from '../models/Waitlist.js';
import crypto from 'crypto';

// @desc    Register for an event
// @route   POST /api/registrations/:eventId
// @access  Private
export const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.status !== 'published' && event.status !== 'ongoing') {
      return res.status(400).json({ message: 'Event is not open for registration' });
    }

    const existingRegistration = await Registration.findOne({ user_id: req.user._id, event_id: event._id });
    if (existingRegistration) {
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    if (event.current_registrations >= event.max_capacity) {
      // Add to waitlist
      const existingWaitlist = await Waitlist.findOne({ user_id: req.user._id, event_id: event._id });
      if (existingWaitlist) {
        return res.status(400).json({ message: 'You are already on the waitlist for this event' });
      }

      const waitlistEntry = await Waitlist.create({ user_id: req.user._id, event_id: event._id });
      return res.status(201).json({ message: 'Event is full, added to waitlist', status: 'waitlisted', waitlistEntry });
    }

    // Register
    const ticket_id = `TKT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const qr_code_url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket_id}`;

    const registration = await Registration.create({
      user_id: req.user._id,
      event_id: event._id,
      ticket_id,
      qr_code_url,
      status: 'confirmed'
    });

    event.current_registrations += 1;
    await event.save();

    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's registrations
// @route   GET /api/registrations/my-tickets
// @access  Private
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await Registration.find({ user_id: req.user._id })
      .populate('event_id', 'title start_datetime venue banner_url');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
