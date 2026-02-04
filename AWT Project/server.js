const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Mock data for events
const events = [
    {
        id: 1,
        title: "Tech Innovation Summit 2026",
        date: "March 15, 2026",
        location: "Main Auditorium",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2670",
        description: "Join us for a showcase of the latest student innovations and tech talks."
    },
    {
        id: 2,
        title: "Annual Cultural Fest",
        date: "April 20-22, 2026",
        location: "Campus Grounds",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2670",
        description: "Three days of music, dance, and art. Don't miss the biggest event of the year!"
    },
    {
        id: 3,
        title: "Alumni Meet & Greet",
        date: "May 10, 2026",
        location: "Conference Hall B",
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=2670",
        description: "Network with successful alumni and gain career insights."
    }
];

// API endpoint to get events
app.get('/api/events', (req, res) => {
    res.json(events);
});

// Fallback route removed to prevent PathError in newer Express versions
// app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
