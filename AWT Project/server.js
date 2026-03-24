const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./utils/dbConfig');
const User = require('./models/User');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to Database
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// View Engine Setup removed for React SPA

// User Identity Middleware
app.use(async (req, res, next) => {
    const userId = req.cookies.userId;
    if (userId) {
        try {
            const user = await User.findById(userId).select('-password');
            req.user = user;
        } catch (e) {
            req.user = null;
        }
    } else {
        req.user = null;
    }
    res.locals.user = req.user; // Make user available to all views
    next();
});

// Initialize default admin if not exists
// Simple hash function using crypto (should ideally use bcryptjs as per plan, but keeping consistent for now, will update auth routes to use bcryptjs and then update this)
const bcrypt = require('bcryptjs');

(async () => {
    try {
        const adminEmail = 'admin@college.edu';
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            console.log('Default admin account created: admin@college.edu / admin123');
        }
    } catch (err) {
        console.error('Error initializing default admin:', err);
    }
})();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/clubs', require('./routes/clubRoutes')); // New Clubs Route

// View Routes (converted to API endpoints)
const clubsTemplate = [
    { name: "Coding Club", icon: "💻", description: "Learn, code, and build projects together." },
    { name: "Dance Society", icon: "💃", description: "Express yourself through rhythm and movement." },
    { name: "Music Club", icon: "🎵", description: "Jam sessions, concerts, and musical workshops." },
    { name: "Photography", icon: "📸", description: "Capture the best moments of campus life." },
    { name: "Debate Society", icon: "🗣️", description: "Voice your opinion and master the art of argumentation." },
    { name: "Robotics", icon: "🤖", description: "Build the future with wires and code." }
];

const Event = require('./models/Event');

app.get('/api/featured-events', async (req, res) => {
    try {
        const events = await Event.find({}).sort({ date: 1 }).limit(10);
        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch featured events' });
    }
});

app.get('/api/my-events', async (req, res) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const user = await User.findById(req.user._id).populate('enrolledEvents');
        res.json(user.enrolledEvents);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user events' });
    }
});

// React static files routing middleware (to be used in production later)
// For now in dev, Vite handles the frontend on port 5173
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
