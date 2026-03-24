const express = require('express');
const router = express.Router();
const Club = require('../models/Club');

// GET all clubs
router.get('/', async (req, res) => {
    try {
        const clubs = await Club.find();

        // If DB is empty, maybe fallback to hardcoded in frontend or just return empty for now
        res.json(clubs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
