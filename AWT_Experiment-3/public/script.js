document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');

    // Fetch todos on load
    fetchTodos();

    // Add todo
    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        if (text) {
            await createTodo(text);
            todoInput.value = '';
            fetchTodos();
        }
    });

    // Fetch and display todos
    async function fetchTodos() {
        try {
            const response = await fetch('/api/todos');
            const todos = await response.json();
            renderTodos(todos);
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    }

    // Create a new todo
    async function createTodo(text) {
        try {
            await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
        } catch (error) {
            console.error('Error creating todo:', error);
        }
    }

    // Delete a todo
    window.deleteTodo = async (id) => {
        try {
            await fetch(`/api/todos/${id}`, {
                method: 'DELETE'
            });
            fetchTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    };

    // Toggle a todo
    window.toggleTodo = async (id, currentStatus) => {
        try {
            await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !currentStatus })
            });
            fetchTodos();
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    };

    // Edit a todo
    window.editTodoPrompt = async (id, currentText) => {
        const newText = prompt('Edit task:', currentText);
        if (newText !== null && newText.trim() !== '') {
            try {
                await fetch(`/api/todos/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: newText.trim() })
                });
                fetchTodos();
            } catch (error) {
                console.error('Error updating todo:', error);
            }
        }
    };

    // Render todos to the DOM
    function renderTodos(todos) {
        todoList.innerHTML = '';

        if (todos.length === 0) {
            todoList.innerHTML = '<li class="empty-state">No tasks yet. Time to get productive!</li>';
            return;
        }

        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            li.innerHTML = `
                <div class="todo-content ${todo.completed ? 'completed' : ''}">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''} onclick="toggleTodo('${todo.id}', ${todo.completed})">
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                </div>
                <div class="todo-actions">
                    <button class="edit-btn" onclick="editTodoPrompt('${todo.id}', '${escapeHtml(todo.text).replace(/'/g, "\\'")}')" aria-label="Edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                    <button class="delete-btn" onclick="deleteTodo('${todo.id}')" aria-label="Delete">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            `;
            todoList.appendChild(li);
        });
    }

    // Utility to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
