const API_BASE = "http://localhost:8086/api";

let selectedListId = null;
let selectedListName = "";

// ===============================
// PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded", function () {
    loadLists();
    loadDashboard();
});


// ===============================
// SECTION NAVIGATION
// ===============================

function showSection(sectionId) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }

    if (sectionId === "lists") {
        loadLists();
    }

    if (sectionId === "overdue") {
        loadOverdueTasks();
    }

    if (sectionId === "dashboard") {
        loadDashboard();
    }
}


// ===============================
// LOAD TASK LISTS
// ===============================

async function loadLists() {

    const container = document.getElementById("listContainer");

    container.innerHTML = "<p>Loading lists...</p>";

    try {

        const response = await fetch(`${API_BASE}/tasklists`);

        if (!response.ok) {
            throw new Error("Unable to load task lists");
        }

        const lists = await response.json();

        container.innerHTML = "";

        if (!lists || lists.length === 0) {

            container.innerHTML = `
                <p>No task lists available.</p>
            `;

            return;
        }

        lists.forEach(list => {

            const card = document.createElement("div");

            card.className = "list-card";

            card.innerHTML = `
                <h3>${escapeHtml(list.name)}</h3>

                <p>
                    ${list.tasks ? list.tasks.length : 0} task(s)
                </p>

                <button onclick="openListTasks(${list.id}, '${escapeHtml(list.name)}')">
                    View Tasks
                </button>

                <button onclick="deleteList(${list.id})">
                    Delete
                </button>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error("Load lists error:", error);

        container.innerHTML = `
            <p style="color:red;">
                Unable to load task lists.
            </p>
        `;
    }
}


// ===============================
// CREATE LIST FORM
// ===============================

function openListForm() {

    document.getElementById("listModal").style.display = "flex";

    document.getElementById("listName").value = "";
}


function closeListForm() {

    document.getElementById("listModal").style.display = "none";
}


// ===============================
// CREATE LIST
// ===============================

async function createList() {

    const nameInput = document.getElementById("listName");

    const name = nameInput.value.trim();

    if (!name) {

        alert("Please enter a list name.");

        return;
    }

    try {

        /*
         * Your backend uses:
         * @RequestParam String name
         * @RequestParam Long userId
         *
         * Therefore we must send query parameters.
         */

        const userId = 1;

        const url =
            `${API_BASE}/tasklists?name=${encodeURIComponent(name)}&userId=${userId}`;

        const response = await fetch(url, {
            method: "POST"
        });

        if (!response.ok) {

            const errorText = await response.text();

            console.error("Create list error:", errorText);

            throw new Error("Unable to create list");
        }

        const createdList = await response.json();

        console.log("Created list:", createdList);

        alert("Task list created successfully!");

        closeListForm();

        // Immediately reload lists from database
        await loadLists();

        // Show My Lists section
        showSection("lists");

    } catch (error) {

        console.error(error);

        alert("Unable to create task list. Please check the backend.");
    }
}


// ===============================
// OPEN TASKS OF A LIST
// ===============================

function openListTasks(listId, listName) {

    selectedListId = listId;

    selectedListName = listName;

    document.getElementById("selectedListName").textContent =
        listName + " Tasks";

    showSection("tasks");

    loadTasks(listId);
}


// ===============================
// LOAD TASKS
// ===============================

async function loadTasks(listId) {

    const container = document.getElementById("taskContainer");

    container.innerHTML = "<p>Loading tasks...</p>";

    try {

        const response = await fetch(`${API_BASE}/tasks`);

        if (!response.ok) {
            throw new Error("Unable to load tasks");
        }

        const tasks = await response.json();

        const listTasks = tasks.filter(task => {

            return task.taskList &&
                   task.taskList.id === listId;

        });

        container.innerHTML = "";

        if (listTasks.length === 0) {

            container.innerHTML = `
                <p>No tasks in this list.</p>
            `;

            return;
        }

        listTasks.forEach(task => {

            const card = document.createElement("div");

            card.className = "task-card";

            card.innerHTML = `
                <h3>${escapeHtml(task.title)}</h3>

                <p>
                    Due Date:
                    ${task.dueDate || "No date"}
                </p>

                <p>
                    Priority:
                    ${task.priority || "LOW"}
                </p>

                <p>
                    Status:
                    ${task.completed ? "Completed" : "Pending"}
                </p>

                <button onclick="completeTask(${task.id})">
                    ${task.completed ? "Completed" : "Mark Complete"}
                </button>

                <button onclick="deleteTask(${task.id})">
                    Delete
                </button>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error("Load tasks error:", error);

        container.innerHTML = `
            <p style="color:red;">
                Unable to load tasks.
            </p>
        `;
    }
}


// ===============================
// TASK FORM
// ===============================

function openTaskForm() {

    if (!selectedListId) {

        alert("Please select a task list first.");

        return;
    }

    document.getElementById("taskModal").style.display = "flex";

    document.getElementById("taskTitle").value = "";

    document.getElementById("taskDueDate").value = "";

    document.getElementById("taskPriority").value = "LOW";
}


function closeTaskForm() {

    document.getElementById("taskModal").style.display = "none";
}


// ===============================
// CREATE TASK
// ===============================

async function createTask() {

    if (!selectedListId) {

        alert("Please select a task list first.");

        return;
    }

    const title =
        document.getElementById("taskTitle").value.trim();

    const dueDate =
        document.getElementById("taskDueDate").value;

    const priority =
        document.getElementById("taskPriority").value;

    if (!title) {

        alert("Please enter a task title.");

        return;
    }

    if (!dueDate) {

        alert("Please select a due date.");

        return;
    }

    try {

        const url =
            `${API_BASE}/tasks` +
            `?title=${encodeURIComponent(title)}` +
            `&dueDate=${encodeURIComponent(dueDate)}` +
            `&priority=${encodeURIComponent(priority)}` +
            `&completed=false` +
            `&taskListId=${selectedListId}`;

        const response = await fetch(url, {
            method: "POST"
        });

        if (!response.ok) {

            const errorText = await response.text();

            console.error("Create task error:", errorText);

            throw new Error("Unable to create task");
        }

        const task = await response.json();

        console.log("Created task:", task);

        alert("Task created successfully!");

        closeTaskForm();

        await loadTasks(selectedListId);

        await loadLists();

        await loadDashboard();

    } catch (error) {

        console.error(error);

        alert("Unable to create task. Please check the backend.");
    }
}


// ===============================
// COMPLETE TASK
// ===============================

async function completeTask(taskId) {

    try {

        const response = await fetch(
            `${API_BASE}/tasks/${taskId}/complete`,
            {
                method: "PUT"
            }
        );

        if (!response.ok) {

            throw new Error("Unable to complete task");
        }

        alert("Task completed!");

        await loadTasks(selectedListId);

        await loadLists();

        await loadDashboard();

    } catch (error) {

        console.error(error);

        alert("Unable to complete task.");
    }
}


// ===============================
// DELETE TASK
// ===============================

async function deleteTask(taskId) {

    if (!confirm("Are you sure you want to delete this task?")) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/tasks/${taskId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            throw new Error("Unable to delete task");
        }

        alert("Task deleted successfully!");

        await loadTasks(selectedListId);

        await loadLists();

        await loadDashboard();

    } catch (error) {

        console.error(error);

        alert("Unable to delete task.");
    }
}


// ===============================
// DELETE LIST
// ===============================

async function deleteList(listId) {

    if (!confirm("Are you sure you want to delete this list?")) {
        return;
    }

    try {

        const response = await fetch(
            `${API_BASE}/tasklists/${listId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {

            throw new Error("Unable to delete list");
        }

        alert("Task list deleted successfully!");

        await loadLists();

        await loadDashboard();

    } catch (error) {

        console.error(error);

        alert("Unable to delete task list.");
    }
}


// ===============================
// OVERDUE TASKS
// ===============================

async function loadOverdueTasks() {

    const container =
        document.getElementById("overdueContainer");

    container.innerHTML =
        "<p>Loading overdue tasks...</p>";

    try {

        const response =
            await fetch(`${API_BASE}/tasks/overdue`);

        if (!response.ok) {

            throw new Error("Unable to load overdue tasks");
        }

        const tasks = await response.json();

        container.innerHTML = "";

        if (!tasks || tasks.length === 0) {

            container.innerHTML = `
                <p>No overdue tasks 🎉</p>
            `;

            return;
        }

        tasks.forEach(task => {

            const card =
                document.createElement("div");

            card.className = "task-card";

            card.innerHTML = `
                <h3>${escapeHtml(task.title)}</h3>

                <p>
                    Due Date: ${task.dueDate}
                </p>

                <p>
                    Priority: ${task.priority}
                </p>

                <p>
                    List:
                    ${
                        task.taskList
                            ? escapeHtml(task.taskList.name)
                            : "Unknown"
                    }
                </p>
            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <p style="color:red;">
                Unable to load overdue tasks.
            </p>
        `;
    }
}


// ===============================
// DASHBOARD
// ===============================

async function loadDashboard() {

    try {

        const listsResponse =
            await fetch(`${API_BASE}/tasklists`);

        const tasksResponse =
            await fetch(`${API_BASE}/tasks`);

        if (!listsResponse.ok || !tasksResponse.ok) {
            return;
        }

        const lists =
            await listsResponse.json();

        const tasks =
            await tasksResponse.json();

        const totalLists =
            lists.length;

        const totalTasks =
            tasks.length;

        const completedTasks =
            tasks.filter(task => task.completed).length;

        const today =
            new Date().toISOString().split("T")[0];

        const overdueTasks =
            tasks.filter(task =>
                !task.completed &&
                task.dueDate &&
                task.dueDate < today
            ).length;

        document.getElementById("totalLists").textContent =
            totalLists;

        document.getElementById("totalTasks").textContent =
            totalTasks;

        document.getElementById("completedTasks").textContent =
            completedTasks;

        document.getElementById("overdueTasks").textContent =
            overdueTasks;

    } catch (error) {

        console.error("Dashboard error:", error);
    }
}


// ===============================
// ESCAPE HTML
// ===============================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ===============================
// CLOSE MODALS WHEN CLICKING OUTSIDE
// ===============================

window.addEventListener("click", function (event) {

    const listModal =
        document.getElementById("listModal");

    const taskModal =
        document.getElementById("taskModal");

    if (event.target === listModal) {
        closeListForm();
    }

    if (event.target === taskModal) {
        closeTaskForm();
    }

});