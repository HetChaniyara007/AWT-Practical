document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchEvents();
    initTheme();
});

let currentUser = null;

async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        currentUser = data.user;
        updateUI();
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}



function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');

    // Check local storage or system preference
    if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
        document.documentElement.setAttribute('data-theme', 'light');
        if (themeToggle) themeToggle.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (themeToggle) themeToggle.textContent = '☀️';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);

            themeToggle.textContent = newTheme === 'light' ? '🌙' : '☀️';
        });
    }
}

async function fetchEvents() {
    try {
        const response = await fetch('/api/events');
        const events = await response.json();
        renderEvents(events);
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

function renderEvents(events) {
    const eventsGrid = document.querySelector('.events-grid');
    if (!eventsGrid) return;

    eventsGrid.innerHTML = events.map(event => `
        <div class="event-card">
            <img src="${event.image}" alt="${event.title}" class="card-image">
            <div class="card-content">
                <span class="event-date">${event.date}</span>
                <h3>${event.title}</h3>
                <div class="event-location">
                    <span>📍</span> ${event.location}
                </div>
                <p class="event-description">${event.description}</p>
                ${currentUser && currentUser.role === 'admin'
            ? `<button onclick="deleteEvent(${event.id})" style="background:rgba(239, 68, 68, 0.2); color:#ef4444; border:1px solid #ef4444; padding:5px 15px; border-radius:50px; margin-top:10px; cursor:pointer;">Delete</button>`
            : ''}
            </div>
        </div>
    `).join('');
}

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
        const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchEvents();
        } else {
            alert('Failed to delete event');
        }
    } catch (e) {
        console.error(e);
        alert('Error deleting event');
    }
}

// Admin Create Event Logic
function showCreateEventModal() {
    document.getElementById('createEventModal').style.display = 'flex';
}

const createEventForm = document.getElementById('createEventForm');
if (createEventForm) {
    createEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('evtTitle').value;
        const date = document.getElementById('evtDate').value;
        const location = document.getElementById('evtLocation').value;
        const description = document.getElementById('evtDesc').value;
        const image = document.getElementById('evtImage').value;

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, date, location, description, image })
            });
            if (res.ok) {
                document.getElementById('createEventModal').style.display = 'none';
                createEventForm.reset();
                fetchEvents();
            } else {
                alert('Failed to create event');
            }
        } catch (e) {
            console.error(e);
            alert('Error creating event');
        }
    });
}

// Show create button if admin
function updateUI() {
    const loginBtn = document.querySelector('.btn-login');
    const navLinks = document.querySelector('.nav-links');
    const createBtn = document.getElementById('createEventBtn');

    if (currentUser) {
        if (loginBtn) {
            loginBtn.textContent = 'Logout';
            loginBtn.href = '#';
            loginBtn.replaceWith(loginBtn.cloneNode(true)); // remove old listeners
            const newLoginBtn = document.querySelector('.btn-login');
            newLoginBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.reload();
            });
        }

        // Add "Hello, Name" to nav if not already there
        if (!document.getElementById('user-greeting')) {
            const userItem = document.createElement('li');
            userItem.id = 'user-greeting';
            userItem.innerHTML = `<span style="color: var(--accent-blue)">Hi, ${currentUser.name}</span>`;
            navLinks.insertBefore(userItem, navLinks.firstChild);
        }

        // Show create button
        if (currentUser.role === 'admin' && createBtn) {
            createBtn.style.display = 'block';
        }
    }
}
