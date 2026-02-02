const http = require('http');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

const port = 3000;

// Custom EventTracker class extending EventEmitter
class EventTracker extends EventEmitter { }
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

const server = http.createServer((req, res) => {
    // Helper to serve JSON
    const sendJSON = (data, statusCode = 200) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    };

    // Helper to serve Static Files
    const serveFile = (filePath, contentType) => {
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    res.writeHead(404);
                    res.end('File not found');
                } else {
                    res.writeHead(500);
                    res.end(`Server Error: ${err.code}`);
                }
            } else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    };

    // --- ROUTING ---

    // 1. Static Files (Frontend)
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
        serveFile(path.join(__dirname, 'public', 'index.html'), 'text/html');
    }
    else if (req.method === 'GET' && req.url === '/style.css') {
        serveFile(path.join(__dirname, 'public', 'style.css'), 'text/css');
    }

    // 2. API: Trigger Event
    else if (req.method === 'POST' && req.url === '/trigger-event') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const { type, data } = JSON.parse(body);
                if (eventCounts.hasOwnProperty(type)) {
                    eventTracker.emit(type, data);
                    sendJSON({ success: true, message: `Event '${type}' emitted.` });
                } else {
                    sendJSON({ success: false, message: 'Invalid event type.' }, 400);
                }
            } catch (e) {
                sendJSON({ success: false, message: 'Invalid JSON' }, 400);
            }
        });
    }

    // 3. API: Summary
    else if (req.method === 'GET' && req.url === '/summary') {
        eventTracker.emit('summary');
        sendJSON({ success: true, counts: eventCounts });
    }

    // 4. 404 Not Found
    else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
