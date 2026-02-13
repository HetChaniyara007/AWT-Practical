const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    president: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});

const Club = mongoose.model('Club', clubSchema);

// Seed Data
const seedClubs = async () => {
    try {
        const count = await Club.countDocuments();
        if (count === 0) {
            const clubs = [
                {
                    name: 'Coding Club',
                    description: 'A community for developers to learn, build, and share knowledge about programming and technology.',
                    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1000',
                    president: 'Sarah Connor',
                    email: 'coding@college.edu'
                },
                {
                    name: 'Music Club',
                    description: 'Jam sessions, concerts, and music appreciation events for all music lovers.',
                    image: 'https://images.unsplash.com/photo-1514320291940-bf79717463fe?auto=format&fit=crop&q=80&w=1000',
                    president: 'Marty McFly',
                    email: 'music@college.edu'
                },
                {
                    name: 'Dance Club',
                    description: 'Express yourself through movement. Workshops in hip-hop, contemporary, and salsa.',
                    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1000',
                    president: 'Kevin Bacon',
                    email: 'dance@college.edu'
                },
                {
                    name: 'Photography Club',
                    description: 'Capture the moments that matter. Photo walks, editing workshops, and exhibitions.',
                    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1000',
                    president: 'Peter Parker',
                    email: 'photo@college.edu'
                },
                {
                    name: 'Debate Society',
                    description: 'Sharpen your public speaking and critical thinking skills through structured debates.',
                    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b0b30741?auto=format&fit=crop&q=80&w=1000',
                    president: 'Elizabeth Bennett',
                    email: 'debate@college.edu'
                },
                {
                    name: 'Robotics Club',
                    description: 'Build the future. Designing and programming robots for competitions and fun.',
                    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd90f9?auto=format&fit=crop&q=80&w=1000',
                    president: 'Tony Stark',
                    email: 'robotics@college.edu'
                }
            ];

            await Club.insertMany(clubs);
            console.log('Clubs seeded successfully');
        }
    } catch (error) {
        console.error('Error seeding clubs:', error);
    }
};

seedClubs();

module.exports = Club;
