const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const db = require('./utils/db');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize default admin if not exists
// Simple hash function using crypto (same as in authRoutes, ideally shared)
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

(async () => {
    try {
        const users = await db.getUsers();
        if (!users.find(u => u.email === 'admin@college.edu')) {
            users.push({
                id: 'admin',
                name: 'Admin User',
                email: 'admin@college.edu',
                password: hashPassword('admin123'),
                role: 'admin'
            });
            await db.saveUsers(users);
            console.log('Default admin account created: admin@college.edu / admin123');
        }
    } catch (err) {
        console.error('Error initializing db:', err);
    }
})();

// Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Fallback for SPA (Optional, but good for reliable navigation if we were using a framework)
// For now, static files handle basic nav.

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
