const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const EVENTS_FILE = path.join(DATA_DIR, 'events.json');

// Helper to ensure data directory exists
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

async function readJSON(file) {
    try {
        await ensureDataDir();
        const data = await fs.readFile(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return []; // Return empty array if file doesn't exist
        }
        throw error;
    }
}

async function writeJSON(file, data) {
    await ensureDataDir();
    await fs.writeFile(file, JSON.stringify(data, null, 2));
}

module.exports = {
    getUsers: () => readJSON(USERS_FILE),
    saveUsers: (users) => writeJSON(USERS_FILE, users),
    getEvents: () => readJSON(EVENTS_FILE),
    saveEvents: (events) => writeJSON(EVENTS_FILE, events)
};
