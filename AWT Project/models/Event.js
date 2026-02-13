const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    organizer: {
        type: String,
        default: 'College Administration'
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2670'
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
