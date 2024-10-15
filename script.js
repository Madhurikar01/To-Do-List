const taskInput = document.getElementById("task-input");
const dueDateInput = document.getElementById("due-date-input");
const prioritySelect = document.getElementById("priority-select");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const filterSelect = document.getElementById("filter-select");
const searchInput = document.getElementById("search-input");
const themeToggle = document.getElementById("theme-toggle");
const taskSelect = document.getElementById("task-select");
const editTaskBtn = document.getElementById("edit-task-btn");
const deleteTaskBtn = document.getElementById("delete-task-btn");
const deleteAllBtn = document.getElementById("delete-all-btn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let theme = localStorage.getItem("theme") || "light";

document.body.classList.toggle("dark-mode", theme === "dark");
themeToggle.checked = theme === "dark";

renderTasks();

addTaskBtn.addEventListener("click", function () {
    const taskText = taskInput.value.trim();
    const dueDate = dueDateInput.value;
    const priority = prioritySelect.value;

    if (!validateInputs(taskText, dueDate, priority)) return;

    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        dueDate: dueDate,
        priority: priority,
    };

    tasks.push(task);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
    resetInputFields();
});

function validateInputs(taskText, dueDate, priority) {
    if (taskText === "") {
        alert("Please enter a task.");
        return false;
    }
    if (dueDate === "") {
        alert("Please select a due date.");
        return false;
    }

    const today = new Date().toISOString().split("T")[0];
    if (dueDate < today) {
        alert("Due date cannot be in the past.");
        return false;
    }

    if (priority === "") {
        alert("Please select a priority.");
        return false;
    }
    return true;
}

function resetInputFields() {
    taskInput.value = "";
    dueDateInput.value = "";
    prioritySelect.value = "";
}

function renderTasks() {
    const filter = filterSelect.value;
    taskList.innerHTML = "";
    taskSelect.innerHTML = "<option value=''>--Select Task--</option>";

    const filteredTasks = tasks.filter(task => {
        if (filter === "completed") return task.completed;
        if (filter === "pending") return !task.completed;
        return true;
    });

    filteredTasks.forEach(task => {
        const listItem = createTaskListItem(task);
        taskList.appendChild(listItem);
        const option = document.createElement("option");
        option.value = task.id;
        option.textContent = task.text;
        taskSelect.appendChild(option);
    });

    updateSelectionState();
}

function createTaskListItem(task) {
    const listItem = document.createElement("li");
    listItem.classList.toggle("completed", task.completed);

    const taskText = document.createElement("span");
    taskText.textContent = task.text;
    taskText.classList.add("task-text");

    const prioritySpan = document.createElement("span");
    prioritySpan.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    prioritySpan.classList.add("task-priority");

    switch (task.priority) {
        case "high":
            prioritySpan.style.color = "red";
            break;
        case "medium":
            prioritySpan.style.color = "orange";
            break;
        default:
            prioritySpan.style.color = "green";
    }

    const today = new Date();
    const dueDate = new Date(task.dueDate);

    if (dueDate < today && !task.completed) {
        listItem.classList.add("overdue");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.classList.add("checkbox");
    checkbox.setAttribute("data-id", task.id);

    updateCheckboxStyle(checkbox, task.completed);

    checkbox.addEventListener("change", () => {
        task.completed = checkbox.checked;
        localStorage.setItem("tasks", JSON.stringify(tasks));
        renderTasks();
    });

    const taskContent = document.createElement("div");
    taskContent.classList.add("task-content");
    taskContent.appendChild(taskText);
    taskContent.appendChild(prioritySpan);

    listItem.prepend(checkbox);
    listItem.appendChild(taskContent);
    return listItem;
}

function updateCheckboxStyle(checkbox, isCompleted) {
    checkbox.style.backgroundColor = isCompleted ? "green" : "";
    checkbox.style.borderColor = isCompleted ? "green" : "";
}

function updateSelectionState() {
    const selectedValue = taskSelect.value;
    const isTaskSelected = selectedValue !== "";
    editTaskBtn.disabled = !isTaskSelected;
    deleteTaskBtn.disabled = !isTaskSelected;
}

editTaskBtn.addEventListener("click", function () {
    const selectedTaskId = parseInt(taskSelect.value);
    const task = tasks.find(t => t.id === selectedTaskId);

    if (task) {
        const newTaskText = prompt("Edit Task:", task.text);
        const newPriority = prompt("Edit Priority (low, medium, high):", task.priority);

        if (validateEditInputs(newTaskText, newPriority)) {
            task.text = newTaskText;
            task.priority = newPriority.toLowerCase();
            localStorage.setItem("tasks", JSON.stringify(tasks));
            renderTasks();
        }
    }
});

function validateEditInputs(newTaskText, newPriority) {
    if (!newTaskText || newTaskText.trim() === "") {
        alert("Task cannot be empty.");
        return false;
    }
    if (["low", "medium", "high"].indexOf(newPriority) === -1) {
        alert("Priority must be low, medium, or high.");
        return false;
    }
    return true;
}

deleteTaskBtn.addEventListener("click", function () {
    const selectedTaskId = parseInt(taskSelect.value);
    if (selectedTaskId) {
        deleteTask(selectedTaskId);
    }
});

deleteAllBtn.addEventListener("click", function () {
    if (tasks.length === 0) {
        alert("There are no tasks to delete.");
    } else {
        if (confirm("Are you sure you want to delete all tasks?")) {
            tasks = [];
            localStorage.removeItem("tasks");
            renderTasks();
        }
    }
});

function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTasks();
}

filterSelect.addEventListener("change", function () {
    renderTasks();
});

searchInput.addEventListener("input", function () {
    const searchTerm = searchInput.value.toLowerCase();
    taskList.innerHTML = "";
    let hasResults = false;

    tasks.forEach(task => {
        if (task.text.toLowerCase().includes(searchTerm)) {
            const listItem = createTaskListItem(task);
            taskList.appendChild(listItem);
            hasResults = true;
        }
    });

    const noResultsMessage = document.getElementById("no-results-message");
    if (!hasResults) {
        noResultsMessage.classList.remove("hidden");
    } else {
        noResultsMessage.classList.add("hidden");
    }
});

themeToggle.addEventListener("change", function () {
    document.body.classList.toggle("dark-mode");
    const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    localStorage.setItem("theme", currentTheme);
});

taskSelect.addEventListener("change", function () {
    updateSelectionState();
});

renderTasks();
