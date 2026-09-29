const API_BASE = "/api";

let selectedListId = null;
let selectedListName = "";

async function apiRequest(path, options = {}) {
    const method = options.method || "GET";
    const response = await fetch(`${API_BASE}${path}`, {
        cache: method === "GET" ? "no-store" : "no-cache",
        ...options
    });
    const responseText = await response.text();
    let data = null;

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch (error) {
            data = responseText;
            if (response.ok && response.headers.get("content-type")?.includes("json")) {
                throw new Error(`${method} ${path} returned invalid JSON: ${responseText}`);
            }
        }
    }

    if (!response.ok) {
        const backendMessage = typeof data === "string"
            ? data
            : data?.detail || data?.message || data?.error;
        throw new Error(
            `${method} ${path} failed (${response.status})${backendMessage ? `: ${backendMessage}` : ""}`
        );
    }

    return data;
}

function requireArray(data, path) {
    if (!Array.isArray(data)) {
        throw new Error(`GET ${path} returned an unexpected response; expected a JSON array.`);
    }
    return data;
}

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

function showSection(sectionId, refresh = true) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }

    if (sectionId === "lists" && refresh) {
        loadLists();
    }

    if (sectionId === "today") {
        loadTodayTasks();
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

        const lists = requireArray(await apiRequest("/tasklists"), "/api/tasklists");

        container.innerHTML = "";

        if (!lists || lists.length === 0) {

            container.innerHTML = `
                <p>No task lists available.</p>
            `;

            return;
        }

        lists.forEach(list => {

            const card = document.createElement("div");
            const title = document.createElement("h3");
            const count = document.createElement("p");
            const viewButton = document.createElement("button");
            const deleteButton = document.createElement("button");

            card.className = "list-card";
            title.textContent = list.name || "Untitled list";
            count.textContent = `${Array.isArray(list.tasks) ? list.tasks.length : 0} task(s)`;
            viewButton.textContent = "View Tasks";
            viewButton.addEventListener("click", () => openListTasks(list.id, list.name || "Untitled list"));
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", () => deleteList(list.id));
            card.append(title, count, viewButton, deleteButton);

            container.appendChild(card);

        });

    } catch (error) {

        console.error("Load lists error:", error);

        container.innerHTML = `
            <p style="color:red;">
                ${escapeHtml(error.message)}
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

    const submitButton = document.querySelector("#listModal .modal-content button");
    if (submitButton.disabled) {
        return;
    }
    submitButton.disabled = true;

    try {
        const users = requireArray(await apiRequest("/users"), "/api/users");
        if (users.length === 0 || users[0].id == null) {
            throw new Error("Cannot create a list because no user exists. Create a user first.");
        }

        const parameters = new URLSearchParams({
            name,
            userId: String(users[0].id)
        });
        await apiRequest(`/tasklists?${parameters}`, { method: "POST" });
        closeListForm();
        showSection("lists", false);
        await Promise.all([loadLists(), loadDashboard()]);
        alert("Task list created successfully!");
    } catch (error) {
        console.error("Create list failed:", error);
        alert(error.message);
    } finally {
        submitButton.disabled = false;
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

        const list = await apiRequest(`/tasklists/${encodeURIComponent(listId)}`);
        if (!list || typeof list !== "object") {
            throw new Error(`GET /api/tasklists/${listId} returned an invalid response.`);
        }
        const listTasks = Array.isArray(list.tasks) ? list.tasks : [];

        if (String(selectedListId) !== String(listId)) {
            return;
        }

        container.innerHTML = "";

        if (listTasks.length === 0) {

            container.innerHTML = `
                <p>No tasks in this list.</p>
            `;

            return;
        }

        const lists = requireArray(await apiRequest("/tasklists"), "/api/tasklists");
        listTasks.forEach(task => container.appendChild(createTaskCard(task, lists, listId)));

    } catch (error) {

        console.error("Load tasks error:", error);

        container.innerHTML = `
            <p style="color:red;">
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}

function findTaskListId(lists, taskId) {
    const owner = lists.find(list =>
        Array.isArray(list.tasks) && list.tasks.some(task => String(task.id) === String(taskId))
    );
    return owner ? owner.id : null;
}

function createTaskCard(task, lists, currentListId) {
    const card = document.createElement("article");
    card.className = "task-card";

    const listOptions = lists
        .filter(list => String(list.id) !== String(currentListId))
        .map(list => `<option value="${Number(list.id)}">${escapeHtml(list.name || "Untitled list")}</option>`)
        .join("");

    card.innerHTML = `
        <h3>${escapeHtml(task.title)}</h3>
        <p>Due Date: ${escapeHtml(task.dueDate || "No date")}</p>
        <p>Priority: ${escapeHtml(task.priority || "LOW")}</p>
        <p>Status: ${task.completed ? "Completed" : "Pending"}</p>
        <div class="task-actions">
            <button type="button" class="completion-button">
                ${task.completed ? "Mark Incomplete" : "Mark Complete"}
            </button>
            <button type="button" class="delete-task-button">Delete</button>
            <label class="move-control">
                Move to
                <select aria-label="Move task to another list">
                    <option value="">Choose list</option>
                    ${listOptions}
                </select>
            </label>
        </div>
    `;

    card.querySelector(".completion-button").addEventListener("click", () => {
        setTaskCompletion(task.id, !task.completed);
    });
    card.querySelector(".delete-task-button").addEventListener("click", () => deleteTask(task.id));
    card.querySelector(".move-control select").addEventListener("change", event => {
        const targetListId = event.target.value;
        if (targetListId) {
            moveTask(task.id, targetListId, currentListId);
        }
    });

    return card;
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

    if (!Number.isFinite(Date.parse(`${dueDate}T00:00:00`))) {
        alert("Please enter a valid due date.");
        return;
    }

    if (!["LOW", "MEDIUM", "HIGH"].includes(priority)) {
        alert("Please select a valid priority.");
        return;
    }

    const submitButton = document.querySelector("#taskModal .modal-content button");
    if (submitButton.disabled) {
        return;
    }
    submitButton.disabled = true;

    try {
        const parameters = new URLSearchParams({
            title,
            dueDate,
            priority,
            completed: "false",
            taskListId: String(selectedListId)
        });
        await apiRequest(`/tasks?${parameters}`, { method: "POST" });
        closeTaskForm();
        await loadTasks(selectedListId);
        await Promise.all([loadLists(), loadDashboard()]);
        alert("Task created successfully!");
    } catch (error) {
        console.error("Create task failed:", error);
        alert(error.message);
    } finally {
        submitButton.disabled = false;
    }
}


// ===============================
// COMPLETE / INCOMPLETE TASK
// ===============================

async function setTaskCompletion(taskId, completed) {
    try {
        const action = completed ? "complete" : "incomplete";
        await apiRequest(`/tasks/${taskId}/${action}`, { method: "PUT" });

        const activeSection = document.querySelector(".section.active")?.id;
        if (selectedListId !== null) {
            await loadTasks(selectedListId);
        }
        if (activeSection === "today") {
            await loadTodayTasks();
        } else if (activeSection === "overdue") {
            await loadOverdueTasks();
        }
        await Promise.all([loadLists(), loadDashboard()]);
        alert(completed ? "Task marked complete." : "Task marked incomplete.");
    } catch (error) {
        console.error("Update task status failed:", error);
        alert(error.message);
    }
}

function completeTask(taskId) {
    return setTaskCompletion(taskId, true);
}

function incompleteTask(taskId) {
    return setTaskCompletion(taskId, false);
}

async function moveTask(taskId, targetListId, sourceListId) {
    if (!targetListId || String(targetListId) === String(sourceListId)) {
        return;
    }

    try {
        const parameters = new URLSearchParams({ taskListId: String(targetListId) });
        await apiRequest(`/tasks/${taskId}/move?${parameters}`, { method: "PUT" });

        const activeSection = document.querySelector(".section.active")?.id;
        if (selectedListId !== null) {
            await loadTasks(selectedListId);
        }
        if (activeSection === "today") {
            await loadTodayTasks();
        } else if (activeSection === "overdue") {
            await loadOverdueTasks();
        }
        await Promise.all([loadLists(), loadDashboard()]);
        alert("Task moved successfully.");
    } catch (error) {
        console.error("Move task failed:", error);
        alert(error.message);
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
        await apiRequest(`/tasks/${taskId}`, { method: "DELETE" });
        alert("Task deleted successfully!");
        await loadTasks(selectedListId);
        await Promise.all([loadLists(), loadDashboard()]);
    } catch (error) {
        console.error("Delete task failed:", error);
        alert(error.message);
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
        await apiRequest(`/tasklists/${listId}`, { method: "DELETE" });
        if (String(selectedListId) === String(listId)) {
            selectedListId = null;
            selectedListName = "";
            document.getElementById("taskContainer").innerHTML = "<p>Select a list to view tasks.</p>";
        }
        alert("Task list deleted successfully!");
        await Promise.all([loadLists(), loadDashboard()]);
    } catch (error) {
        console.error("Delete list failed:", error);
        alert(error.message);
    }
}


// ===============================
// OVERDUE TASKS
// ===============================

async function loadTodayTasks() {
    const container = document.getElementById("todayContainer");
    container.innerHTML = "<p>Loading today's tasks...</p>";

    try {
        const [tasksResponse, listsResponse] = await Promise.all([
            apiRequest("/tasks/today"),
            apiRequest("/tasklists")
        ]);
        const tasks = requireArray(tasksResponse, "/api/tasks/today");
        const lists = requireArray(listsResponse, "/api/tasklists");
        container.innerHTML = "";

        if (tasks.length === 0) {
            container.innerHTML = "<p>No tasks due today.</p>";
            return;
        }

        tasks.forEach(task => {
            const listId = findTaskListId(lists, task.id);
            container.appendChild(createTaskCard(task, lists, listId));
        });
    } catch (error) {
        console.error("Load today's tasks failed:", error);
        container.innerHTML = `<p style="color:red;">${escapeHtml(error.message)}</p>`;
    }
}

async function loadOverdueTasks() {

    const container =
        document.getElementById("overdueContainer");

    container.innerHTML =
        "<p>Loading overdue tasks...</p>";

    try {

        const [tasksResponse, listsResponse] = await Promise.all([
            apiRequest("/tasks/overdue"),
            apiRequest("/tasklists")
        ]);
        const tasks = requireArray(tasksResponse, "/api/tasks/overdue");
        const lists = requireArray(listsResponse, "/api/tasklists");
        const listNamesByTaskId = new Map();
        lists.forEach(list => {
            (Array.isArray(list.tasks) ? list.tasks : []).forEach(task => {
                listNamesByTaskId.set(String(task.id), list.name || "Unknown");
            });
        });

        container.innerHTML = "";

        if (!tasks || tasks.length === 0) {

            container.innerHTML = `
                <p>No overdue tasks 🎉</p>
            `;

            return;
        }

        tasks.forEach(task => {
            const listId = findTaskListId(lists, task.id);
            const card = createTaskCard(task, lists, listId);
            const listName = listNamesByTaskId.get(String(task.id)) || "Unknown";
            const listLabel = document.createElement("p");
            listLabel.textContent = `List: ${listName}`;
            card.insertBefore(listLabel, card.querySelector(".task-actions"));
            container.appendChild(card);
        });

    } catch (error) {

        console.error("Load overdue tasks failed:", error);

        container.innerHTML = `
            <p style="color:red;">
                ${escapeHtml(error.message)}
            </p>
        `;
    }
}


// ===============================
// DASHBOARD
// ===============================

async function loadDashboard() {

    try {

        const [listsResponse, tasksResponse, overdueResponse] = await Promise.all([
            apiRequest("/tasklists"),
            apiRequest("/tasks"),
            apiRequest("/tasks/overdue")
        ]);
        const lists = requireArray(listsResponse, "/api/tasklists");
        const tasks = requireArray(tasksResponse, "/api/tasks");
        const overdue = requireArray(overdueResponse, "/api/tasks/overdue");

        const totalLists =
            lists.length;

        const totalTasks =
            tasks.length;

        const completedTasks =
            tasks.filter(task => task.completed).length;

        document.getElementById("totalLists").textContent =
            totalLists;

        document.getElementById("totalTasks").textContent =
            totalTasks;

        document.getElementById("completedTasks").textContent =
            completedTasks;

        document.getElementById("overdueTasks").textContent =
            overdue.length;

    } catch (error) {

        console.error("Dashboard load failed:", error);
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