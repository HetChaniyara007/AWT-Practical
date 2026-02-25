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

module.exports = Club;
