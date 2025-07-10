// Select DOM elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const filterButtons = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editingTaskId = null;

// Function to save tasks to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to create a task HTML element
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'task-item';
  if (task.completed) li.classList.add('completed');
  li.dataset.id = task.id;

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.addEventListener('change', () => toggleComplete(task.id));

  // Task text
  const taskText = document.createElement('span');
  taskText.className = 'task-text';
  taskText.textContent = task.text;
  taskText.title = 'Click to edit task';
  taskText.addEventListener('click', () => startEditingTask(task.id));

  // Timestamp (optional)
  const timeStamp = document.createElement('span');
  timeStamp.className = 'task-time';
  timeStamp.textContent = new Date(task.createdAt).toLocaleString();

  // Actions container
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'action-btn';
  deleteBtn.innerHTML = '&#x2716;'; // Cross mark
  deleteBtn.title = 'Delete task';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  actions.appendChild(deleteBtn);

  li.appendChild(checkbox);
  li.appendChild(taskText);
  li.appendChild(timeStamp);
  li.appendChild(actions);

  return li;
}

// Render tasks based on current filter
function renderTasks() {
  taskList.innerHTML = '';

  let filteredTasks;
  if (currentFilter === 'all') {
    filteredTasks = tasks;
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(t => t.completed);
  } else {
    filteredTasks = tasks.filter(t => !t.completed);
  }

  filteredTasks.forEach(task => {
    const taskElement = createTaskElement(task);
    taskList.appendChild(taskElement);
  });
}

// Add new task
function addTask(text) {
  const newTask = {
    id: Date.now().toString(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasks();
  renderTasks();
}

// Toggle task completion status
function toggleComplete(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

// Delete task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Start editing a task
function startEditingTask(id) {
  if (editingTaskId) return; // Prevent editing multiple tasks at once

  editingTaskId = id;
  const li = [...taskList.children].find(item => item.dataset.id === id);
  if (!li) return;

  const task = tasks.find(t => t.id === id);
  if (!task) return;

  // Replace text with input field
  const taskTextSpan = li.querySelector('.task-text');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = task.text;
  input.className = 'edit-input';
  input.style.flexGrow = '1';

  // Replace task text with input
  li.replaceChild(input, taskTextSpan);
  input.focus();

  // Save changes on enter or blur
  function saveEdit() {
    const newValue = input.value.trim();
    if (newValue) {
      tasks = tasks.map(t => (t.id === id ? { ...t, text: newValue } : t));
      saveTasks();
      renderTasks();
    } else {
      // If empty, don't update and revert
      renderTasks();
    }
    editingTaskId = null;
  }

  input.addEventListener('blur', saveEdit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      input.blur();
    } else if (e.key === 'Escape') {
      editingTaskId = null;
      renderTasks();
    }
  });
}

// Handle form submit
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  addTask(text);
  taskInput.value = '';
});

// Filter buttons functionality
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Initial render
renderTasks();
