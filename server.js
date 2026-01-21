const express = require('express');
const EventEmitter = require('events');
const app = express();
const port = 3000;

// Serve static files from 'public' directory
app.use(express.static('public'));
app.use(express.json());

// Custom EventTracker class extending EventEmitter
class EventTracker extends EventEmitter {}
const eventTracker = new EventTracker();

// Store event counts
const eventCounts = {
    'user-login': 0,
    'user-logout': 0,
    'user-purchase': 0,
    'profile-update': 0
};

// Listen for specific events
eventTracker.on('user-login', (data) => {
    eventCounts['user-login']++;
    console.log(`[EVENT] User Login: ${data.username} at ${new Date().toLocaleTimeString()}`);
});

eventTracker.on('user-logout', (data) => {
    eventCounts['user-logout']++;
    console.log(`[EVENT] User Logout: ${data.username}`);
});

eventTracker.on('user-purchase', (data) => {
    eventCounts['user-purchase']++;
    console.log(`[EVENT] User Purchase: ${data.username} bought ${data.item} for $${data.price}`);
});

eventTracker.on('profile-update', (data) => {
    eventCounts['profile-update']++;
    console.log(`[EVENT] Profile Update: ${data.username} updated ${data.field}`);
});

// Summary event
eventTracker.on('summary', () => {
    console.log('\n--- EVENT SUMMARY ---');
    console.log(eventCounts);
    console.log('---------------------\n');
});

// Endpoint to trigger events
app.post('/trigger-event', (req, res) => {
    const { type, data } = req.body;
    
    if (eventCounts.hasOwnProperty(type)) {
        eventTracker.emit(type, data);
        res.json({ success: true, message: `Event '${type}' emitted.` });
    } else {
        res.status(400).json({ success: false, message: 'Invalid event type.' });
    }
});

// Endpoint to get summary
app.get('/summary', (req, res) => {
    eventTracker.emit('summary');
    res.json({ success: true, counts: eventCounts });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
