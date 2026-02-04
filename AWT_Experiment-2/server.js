const express = require('express');
const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// In-memory data store
let todos = [];

// Get all todos
app.get('/api/todos', (req, res) => {
    res.json(todos);
});

// Add a new todo
app.post('/api/todos', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    const newTodo = {
        id: Date.now().toString(),
        text: text,
        completed: false
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

// Delete a todo
app.delete('/api/todos/:id', (req, res) => {
    const { id } = req.params;
    todos = todos.filter(todo => todo.id !== id);
    res.status(200).json({ message: 'Deleted successfully' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
