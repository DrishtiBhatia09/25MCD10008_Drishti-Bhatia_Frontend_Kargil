let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const taskNameInput = document.getElementById("taskName");
const taskPriorityInput = document.getElementById("taskPriority");
const taskDeadlineInput = document.getElementById("taskDeadline");
const addTaskBtn = document.getElementById("addTaskBtn");

const sortPriorityBtn = document.getElementById("sortPriority");
const sortDeadlineBtn = document.getElementById("sortDeadline");

const filterAllBtn = document.getElementById("filterAll");
const filterCompletedBtn = document.getElementById("filterCompleted");
const filterPendingBtn = document.getElementById("filterPending");

const taskList = document.getElementById("taskList");
const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");

let currentSort = null; // "priority" or "deadline"
let sortDirection = { priority: "desc", deadline: "asc" }; // Toggle directions
let currentFilter = "all";

// Debounce function
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
  taskList.innerHTML = "";
  const today = new Date();

  // Filter tasks
  let filteredTasks = tasks;
  if (currentFilter === "completed") filteredTasks = tasks.filter(t => t.completed);
  if (currentFilter === "pending") filteredTasks = tasks.filter(t => !t.completed);

  // Sort tasks
  if (currentSort === "priority") {
    const map = { High: 3, Medium: 2, Low: 1 };
    filteredTasks.sort((a, b) => 
      sortDirection.priority === "desc" ? map[b.priority] - map[a.priority] : map[a.priority] - map[b.priority]
    );
  }
  if (currentSort === "deadline") {
    filteredTasks.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return sortDirection.deadline === "asc" 
        ? new Date(a.deadline) - new Date(b.deadline) 
        : new Date(b.deadline) - new Date(a.deadline);
    });
  }

  // Render each task
  filteredTasks.forEach((task, index) => {
    const isOverdue = task.deadline && new Date(task.deadline) < today && !task.completed;

    const col = document.createElement("div");
    col.className = "col-12";

    col.innerHTML = `
      <div class="card ${isOverdue ? 'overdue' : ''}">
        <div class="card-body d-flex justify-content-between align-items-center">
          <span class="${task.completed ? 'completed' : ''}">
            ${task.title} 
            <span class="badge ${task.priority==='High'?'bg-danger':task.priority==='Medium'?'bg-warning':'bg-success'}">${task.priority}</span>
            ${task.deadline ? ` | <small>Due: ${task.deadline}</small>` : ""}
          </span>
          <div class="btn-group">
            <button class="btn btn-sm btn-success toggle-complete">${task.completed ? 'Undo' : 'Complete'}</button>
            <button class="btn btn-sm btn-danger delete-task">🗑</button>
          </div>
        </div>
      </div>
    `;

    col.querySelector(".toggle-complete").addEventListener("click", () => {
      tasks[index].completed = !tasks[index].completed;
      saveTasks();
      renderTasks();
    });

    col.querySelector(".delete-task").addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(col);
  });

  // Update counters
  totalTasksEl.textContent = tasks.length;
  completedTasksEl.textContent = tasks.filter(t => t.completed).length;
  pendingTasksEl.textContent = tasks.filter(t => !t.completed).length;
}

// Add Task
addTaskBtn.addEventListener("click", () => {
  const title = taskNameInput.value.trim();
  const priority = taskPriorityInput.value;
  const deadline = taskDeadlineInput.value;

  if (!title) return alert("Please enter a task name");

  tasks.push({ title, priority, deadline, completed: false });
  saveTasks();
  renderTasks();

  taskNameInput.value = "";
  taskDeadlineInput.value = "";
});

// Sorting with toggle
sortPriorityBtn.addEventListener("click", () => {
  currentSort = "priority";
  sortDirection.priority = sortDirection.priority === "desc" ? "asc" : "desc";
  renderTasks();
});

sortDeadlineBtn.addEventListener("click", () => {
  currentSort = "deadline";
  sortDirection.deadline = sortDirection.deadline === "asc" ? "desc" : "asc";
  renderTasks();
});

// Filtering with debounce
const applyFilter = debounce(() => { renderTasks(); }, 300);

filterAllBtn.addEventListener("click", () => {
  currentFilter = "all";
  filterAllBtn.classList.add("btn-primary");
  filterAllBtn.classList.remove("btn-outline-primary");
  filterCompletedBtn.classList.add("btn-outline-primary");
  filterCompletedBtn.classList.remove("btn-primary");
  filterPendingBtn.classList.add("btn-outline-primary");
  filterPendingBtn.classList.remove("btn-primary");
  applyFilter();
});

filterCompletedBtn.addEventListener("click", () => {
  currentFilter = "completed";
  filterCompletedBtn.classList.add("btn-primary");
  filterCompletedBtn.classList.remove("btn-outline-primary");
  filterAllBtn.classList.add("btn-outline-primary");
  filterAllBtn.classList.remove("btn-primary");
  filterPendingBtn.classList.add("btn-outline-primary");
  filterPendingBtn.classList.remove("btn-primary");
  applyFilter();
});

filterPendingBtn.addEventListener("click", () => {
  currentFilter = "pending";
  filterPendingBtn.classList.add("btn-primary");
  filterPendingBtn.classList.remove("btn-outline-primary");
  filterAllBtn.classList.add("btn-outline-primary");
  filterAllBtn.classList.remove("btn-primary");
  filterCompletedBtn.classList.add("btn-outline-primary");
  filterCompletedBtn.classList.remove("btn-primary");
  applyFilter();
});

// Initial Render
renderTasks();