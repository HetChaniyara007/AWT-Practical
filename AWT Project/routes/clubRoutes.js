const express = require('express');
const router = express.Router();
const Club = require('../models/Club');

// GET all clubs
router.get('/', async (req, res) => {
    try {
        const clubs = await Club.find();
        // Check if user is logged in
        let user = null;
        if (req.cookies.token) {
            // In a real middleware, this would be attached to req.user.
            // We rely on the view knowing if 'user' is passed, 
            // but usually 'user' is local to the response if set by middleware.
            // Here we just want to render the page.
            // The common middleware in server.js should handle extracting the user.
        }

        res.render('clubs', { clubs });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
