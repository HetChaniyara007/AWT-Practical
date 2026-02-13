const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

// Middleware to check if user is admin
const verifyAdmin = async (req, res, next) => {
    // req.user is already populated by server.js middleware if cookie exists
    // However, server.js middleware is run on `app.use`, so it should apply here.
    // Let's verify if req.user is available.
    // server.js: app.use(async (req, res, next) => { ... }) matches globally.
    // But we need to ensure this route uses it.

    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        // Double check using cookie if req.user is somehow missing (e.g. if middleware order issue, but unlikely)
        // For safety, let's rely on req.user from server.js
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
};

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({}).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Create event (Admin only)
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { title, date, time, location, description, image } = req.body;

        if (!title || !date || !time || !location || !description) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newEvent = await Event.create({
            title,
            date,
            time,
            location,
            description,
            image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2670'
        });

        res.json(newEvent);

    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Delete event (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ success: true });

    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

// Register for event (Student only)
router.post('/:id/register', async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized: Please login' });
        }

        const eventId = req.params.id;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check if already registered
        const user = await User.findById(req.user._id);
        if (user.enrolledEvents.includes(eventId)) {
            return res.status(400).json({ error: 'Already registered for this event' });
        }

        user.enrolledEvents.push(eventId);
        await user.save();

        res.json({ success: true, message: 'Successfully registered for event' });

    } catch (error) {
        console.error('Error registering for event:', error);
        res.status(500).json({ error: 'Failed to register for event' });
    }
});

// Get registered students for an event (Admin only)
router.get('/:id/registrations', verifyAdmin, async (req, res) => {
    try {
        const eventId = req.params.id;
        const students = await User.find({ enrolledEvents: eventId }).select('name email role');
        res.json(students);
    } catch (error) {
        console.error('Error fetching registrations:', error);
        res.status(500).json({ error: 'Failed to fetch registrations' });
    }
});

module.exports = router;
