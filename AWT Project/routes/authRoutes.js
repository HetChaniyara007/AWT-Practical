const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student'
        });

        // Set session/cookie (Simple implementation for now)
        res.cookie('userId', newUser._id.toString(), { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day
        res.json({ success: true, user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role } });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session/cookie
        res.cookie('userId', user._id.toString(), { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('userId');
    res.json({ success: true });
});

// Get current user
router.get('/me', async (req, res) => {
    const userId = req.cookies.userId;
    if (userId) {
        try {
            const user = await User.findById(userId).select('-password');
            res.json({ user });
        } catch (e) {
            res.json({ user: null });
        }
    } else {
        res.json({ user: null });
    }
});

module.exports = router;
