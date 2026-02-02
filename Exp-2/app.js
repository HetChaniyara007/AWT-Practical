const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// In-memory data store
let tasks = [];

// Routes
app.get('/', (req, res) => {
    res.render('index', { tasks: tasks });
});

app.post('/add', (req, res) => {
    const task = req.body.task;
    if (task) {
        tasks.push(task);
    }
    res.redirect('/');
});

app.post('/delete', (req, res) => {
    const taskIndex = req.body.taskIndex;
    if (taskIndex !== undefined && taskIndex >= 0 && taskIndex < tasks.length) {
        tasks.splice(taskIndex, 1);
    }
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
