const BASE_URL = 'http://localhost:3000/api';
let studentCookie = '';
let adminCookie = '';
let eventId = '';

async function runTests() {
    console.log('Starting Backend Verification...');

    // 1. Register Student
    try {
        console.log('\n[1] Registering Student...');
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Student',
                email: `student_${Date.now()}@test.com`,
                password: 'password123',
                role: 'student'
            })
        });
        const data = await res.json();
        if (res.ok) {
            console.log('✅ Student Registered:', data.user.email);
            // Capture cookie from response headers if possible, but fetch in node doesn't auto-handle cookies easily like browser.
            // Actually, the server sets 'set-cookie'. We need to extract it.
            const setCookie = res.headers.get('set-cookie');
            if (setCookie) {
                studentCookie = setCookie.split(';')[0];
                console.log('✅ Student Cookie captured');
            }
        } else {
            console.error('❌ Registration Failed:', data);
        }
    } catch (e) { console.error('❌ Error:', e.message); }

    // 2. Login Admin
    try {
        console.log('\n[2] Logging in Admin...');
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@college.edu',
                password: 'admin123'
            })
        });
        const data = await res.json();
        if (res.ok) {
            console.log('✅ Admin Logged In');
            const setCookie = res.headers.get('set-cookie');
            if (setCookie) {
                adminCookie = setCookie.split(';')[0];
                console.log('✅ Admin Cookie captured');
            }
        } else {
            console.error('❌ Admin Login Failed:', data);
        }
    } catch (e) { console.error('❌ Error:', e.message); }

    // 3. Create Event (Admin)
    if (adminCookie) {
        try {
            console.log('\n[3] Creating Event...');
            const res = await fetch(`${BASE_URL}/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': adminCookie
                },
                body: JSON.stringify({
                    title: 'Test Verification Event',
                    date: new Date().toISOString(),
                    time: '10:00 AM',
                    location: 'Test Hall',
                    description: 'This is a test event for verification.'
                })
            });
            const data = await res.json();
            if (res.ok) {
                eventId = data._id;
                console.log('✅ Event Created:', eventId);
            } else {
                console.error('❌ Create Event Failed:', data);
            }
        } catch (e) { console.error('❌ Error:', e.message); }
    }

    // 4. Register for Event (Student)
    if (studentCookie && eventId) {
        try {
            console.log('\n[4] Student Registering for Event...');
            const res = await fetch(`${BASE_URL}/events/${eventId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': studentCookie
                }
            });
            const data = await res.json();
            if (res.ok) {
                console.log('✅ Registered for Event successfully');
            } else {
                console.error('❌ Registration Failed:', data);
            }
        } catch (e) { console.error('❌ Error:', e.message); }
    }

    // 5. Verify Registration (Admin)
    if (adminCookie && eventId) {
        try {
            console.log('\n[5] Verifying Registration (Admin View)...');
            const res = await fetch(`${BASE_URL}/events/${eventId}/registrations`, {
                method: 'GET',
                headers: {
                    'Cookie': adminCookie
                }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                if (data.length > 0) {
                    console.log('✅ Admin sees registrations:', data.length);
                    console.log('✅ Verification Complete!');
                } else {
                    console.error('❌ No registrations found.');
                }
            } else {
                console.error('❌ Fetch Registrations Failed:', data);
            }
        } catch (e) { console.error('❌ Error:', e.message); }
    }
}

runTests();
