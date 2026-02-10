document.addEventListener('DOMContentLoaded', () => {
    // checkAuth(); // redundant
    // fetchEvents(); // redundant
    initTheme();
    setupLogout();
});

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

async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
        const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
        if (res.ok) {
            window.location.reload();
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
                window.location.reload();
            } else {
                alert('Failed to create event');
            }
        } catch (e) {
            console.error(e);
            alert('Error creating event');
        }
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await fetch('/api/auth/logout', { method: 'POST' });
            window.location.href = '/';
        });
    }
}
