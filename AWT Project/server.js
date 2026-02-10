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

// View Engine Setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// User Identity Middleware
app.use((req, res, next) => {
    const userCookie = req.cookies.user;
    if (userCookie) {
        try {
            req.user = JSON.parse(userCookie);
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

// API Routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// View Routes
const clubs = [
    { name: "Coding Club", icon: "💻", description: "Learn, code, and build projects together." },
    { name: "Dance Society", icon: "💃", description: "Express yourself through rhythm and movement." },
    { name: "Music Club", icon: "🎵", description: "Jam sessions, concerts, and musical workshops." },
    { name: "Photography", icon: "📸", description: "Capture the best moments of campus life." },
    { name: "Debate Society", icon: "🗣️", description: "Voice your opinion and master the art of argumentation." },
    { name: "Robotics", icon: "🤖", description: "Build the future with wires and code." }
];

app.get('/', async (req, res) => {
    try {
        const events = await db.getEvents();
        const featuredEvents = events.slice(0, 3);
        res.render('index', { events: featuredEvents });
    } catch (err) {
        console.error(err);
        res.render('index', { events: [] });
    }
});

app.get('/events', async (req, res) => {
    try {
        const events = await db.getEvents();
        res.render('events', { events });
    } catch (err) {
        console.error(err);
        res.render('events', { events: [] });
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
