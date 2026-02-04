document.addEventListener('DOMContentLoaded', () => {
    fetchEvents();
    initTheme();
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
            </div>
        </div>
    `).join('');
}
