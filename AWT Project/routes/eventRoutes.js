const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await db.getEvents(); // Fixed: match db.js export (which was getUsers/saveUsers/getEvents/saveEvents)
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Create event (Admin only)
router.post('/', async (req, res) => {
    // Basic admin check from cookie
    const userCookie = req.cookies.user;
    let user = null;
    if (userCookie) {
        try { user = JSON.parse(userCookie); } catch (e) { }
    }

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const { title, date, location, description, image } = req.body;
        if (!title || !date || !location) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const events = await db.getEvents();
        const newEvent = {
            id: Date.now(),
            title,
            date,
            location,
            description,
            image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2670' // Default image
        };

        events.push(newEvent);
        await db.saveEvents(events);
        res.json(newEvent);

    } catch (error) {
        res.status(500).json({ error: 'Failed to create event' });
    }
});

// Delete event (Admin only)
router.delete('/:id', async (req, res) => {
    const userCookie = req.cookies.user;
    let user = null;
    if (userCookie) {
        try { user = JSON.parse(userCookie); } catch (e) { }
    }

    if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const id = parseInt(req.params.id);
        const events = await db.getEvents();
        const filteredEvents = events.filter(e => e.id !== id);

        if (events.length === filteredEvents.length) {
            return res.status(404).json({ error: 'Event not found' });
        }

        await db.saveEvents(filteredEvents);
        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

module.exports = router;
