const events = require('events');

// Create an eventEmitter object
const eventEmitter = new events.EventEmitter();

// 1. Create an event handler
const myEventHandler = function() {
    console.log('I hear a scream!');
};

// Assign the event handler to an event named 'scream'
eventEmitter.on('scream', myEventHandler);

// Fire the 'scream' event
console.log('Firing the "scream" event...');
eventEmitter.emit('scream');

// 2. Event with arguments
eventEmitter.on('greet', (name) => {
    console.log(`\nHello, ${name}! Welcome to the Event Emitter demonstration.`);
});

console.log('\nFiring the "greet" event with an argument...');
eventEmitter.emit('greet', 'Node.js Developer');

// 3. One-time event
eventEmitter.once('oneTimeEvent', () => {
    console.log('\nThis will only execute once, no matter how many times it is emitted.');
});

console.log('\nFiring the "oneTimeEvent" multiple times...');
eventEmitter.emit('oneTimeEvent');
eventEmitter.emit('oneTimeEvent'); // This line won't trigger the listener again
