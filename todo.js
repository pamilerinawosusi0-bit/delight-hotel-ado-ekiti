const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const tasksList = document.getElementById('tasksList');
const totalCount = document.getElementById('totalCount');
const activeCount = document.getElementById('activeCount');
const completedCount = document.getElementById('completedCount');
const clearAllBtn = document.getElementById('clearAllBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

const STORAGE_KEY = 'todoTasks';
let currentFilter = 'all';

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [
  { id: Date.now(), text: 'Welcome to your task list', completed: false, createdAt: new Date().toISOString() }
];

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function updateStats() {
  totalCount.textContent = tasks.length;
  activeCount.textContent = tasks.filter(task => !task.completed).length;
  completedCount.textContent = tasks.filter(task => task.completed).length;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderTasks() {
  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  if (filteredTasks.length === 0) {
    tasksList.innerHTML = '<div class="empty-state"><p>No tasks here yet. Add a task to begin.</p></div>';
    updateStats();
    return;
  }

  tasksList.innerHTML = filteredTasks.map(task => `
    <div class="task-item ${task.completed ? 'completed' : ''}">
      <input class="task-checkbox" type="checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
      <div class="task-content">
        <div class="task-text">${escapeHtml(task.text)}</div>
        <span class="task-date">${formatDate(task.createdAt)}</span>
      </div>
      <div class="task-actions">
        <button class="task-btn edit-btn" data-action="edit" data-id="${task.id}">Edit</button>
        <button class="task-btn delete-btn" data-action="delete" data-id="${task.id}">Delete</button>
      </div>
    </div>
  `).join('');

  updateStats();
}

function addTask() {
  const value = taskInput.value.trim();
  if (!value) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id: Date.now(),
    text: value,
    completed: false,
    createdAt: new Date().toISOString()
  });

  saveTasks();
  taskInput.value = '';
  taskInput.focus();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map(task =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  const newText = prompt('Edit your task:', task.text);
  if (newText === null) return;

  const trimmed = newText.trim();
  if (!trimmed) return;

  tasks = tasks.map(item =>
    item.id === id ? { ...item, text: trimmed } : item
  );
  saveTasks();
  renderTasks();
}

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') addTask();
});

tasksList.addEventListener('click', event => {
  const checkbox = event.target.closest('.task-checkbox');
  if (checkbox) {
    toggleTask(Number(checkbox.dataset.id));
    return;
  }

  const button = event.target.closest('button');
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === 'delete') deleteTask(id);
  if (action === 'edit') editTask(id);
});

filterButtons.forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach(btn => btn.classList.toggle('active', btn === button));
    renderTasks();
  });
});

clearAllBtn.addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
});

renderTasks();
