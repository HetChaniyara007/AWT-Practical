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

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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

// View Routes
const clubs = [
    { name: "Coding Club", icon: "💻", description: "Learn, code, and build projects together." },
    { name: "Dance Society", icon: "💃", description: "Express yourself through rhythm and movement." },
    { name: "Music Club", icon: "🎵", description: "Jam sessions, concerts, and musical workshops." },
    { name: "Photography", icon: "📸", description: "Capture the best moments of campus life." },
    { name: "Debate Society", icon: "🗣️", description: "Voice your opinion and master the art of argumentation." },
    { name: "Robotics", icon: "🤖", description: "Build the future with wires and code." }
];

const Event = require('./models/Event');

app.get('/', async (req, res) => {
    try {
        const events = await Event.find({}).sort({ date: 1 }).limit(3);
        res.render('index', { events });
    } catch (err) {
        console.error(err);
        res.render('index', { events: [] });
    }
});

app.get('/events', async (req, res) => {
    try {
        const events = await Event.find({}).sort({ date: 1 });
        res.render('events', { events });
    } catch (err) {
        console.error(err);
        res.render('events', { events: [] });
    }
});

app.get('/my-events', async (req, res) => {
    if (!req.user) return res.redirect('/login');
    try {
        const user = await User.findById(req.user._id).populate('enrolledEvents');
        res.render('my-events', { events: user.enrolledEvents });
    } catch (err) {
        console.error(err);
        res.render('my-events', { events: [] });
    }
});

app.get('/admin-dashboard', async (req, res) => {
    if (!req.user || req.user.role !== 'admin') return res.redirect('/');
    try {
        const events = await Event.find({}).sort({ date: 1 });
        res.render('admin-dashboard', { events });
    } catch (err) {
        console.error(err);
        res.render('admin-dashboard', { events: [] });
    }
});

app.get('/clubs', (req, res) => {
    res.render('clubs', { clubs });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/login', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('login');
});

app.get('/register', (req, res) => {
    if (req.user) return res.redirect('/');
    res.render('register');
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

app.get('/privacy', (req, res) => {
    res.render('legal', { title: 'Privacy Policy' });
});

app.get('/terms', (req, res) => {
    res.render('legal', { title: 'Terms of Service' });
});

app.get('/help', (req, res) => {
    res.render('legal', { title: 'Help Center' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
