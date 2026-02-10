const express = require('express');
const router = express.Router();
const db = require('../utils/db');
const crypto = require('crypto');

// Simple hash function using crypto
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const users = await db.getUsers();

        // Check if user exists
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashPassword(password),
            role: role || 'student' // Default to student
        };

        users.push(newUser);
        await db.saveUsers(users); // Fixed: ensure this matches db.js export

        // Set session/cookie
        res.cookie('user', JSON.stringify({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }), { httpOnly: true });
        res.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const users = await db.getUsers();
        const user = users.find(u => u.email === email && u.password === hashPassword(password));

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session/cookie
        res.cookie('user', JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }), { httpOnly: true });
        res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout
router.post('/logout', (req, res) => {
    res.clearCookie('user');
    res.json({ success: true });
});

// Get current user (check session)
router.get('/me', (req, res) => {
    const userCookie = req.cookies.user;
    if (userCookie) {
        try {
            const user = JSON.parse(userCookie);
            res.json({ user });
        } catch (e) {
            res.json({ user: null });
        }
    } else {
        res.json({ user: null });
    }
});

module.exports = router;
