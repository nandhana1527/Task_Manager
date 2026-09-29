package com.personal.task_manager.service;

import com.personal.entity.Priority;
import com.personal.entity.Task;
import com.personal.entity.TaskList;
import com.personal.task_manager.repository.TaskRepository;
import com.personal.task_manager.repository.TaskListRepository;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final TaskListRepository taskListRepository;

    public TaskService(
            TaskRepository taskRepository,
            TaskListRepository taskListRepository) {

        this.taskRepository = taskRepository;
        this.taskListRepository = taskListRepository;
    }

    // ================= CREATE TASK =================

    public Task createTask(
            String title,
            LocalDate dueDate,
            String priority,
            Boolean completed,
            Long taskListId) {

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task title is required");
        }
        if (dueDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Due date is required");
        }
        if (taskListId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task list ID is required");
        }

        TaskList taskList = taskListRepository
                .findById(taskListId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Task list with ID " + taskListId + " not found"));

        Task task = new Task();

        task.setTitle(title.trim());
        task.setDueDate(dueDate);
        task.setPriority(parsePriority(priority));
        task.setCompleted(Boolean.TRUE.equals(completed));

        task.setTaskList(taskList);

        return taskRepository.save(task);
    }

    // ================= GET ALL TASKS =================

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    // ================= GET TASK BY ID =================

    public Task getTaskById(Long id) {

        return taskRepository
                .findById(id)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Task with ID " + id + " not found"));
    }

    // ================= UPDATE TASK =================

    public Task updateTask(
            Long id,
            String title,
            LocalDate dueDate,
            String priority) {

        Task task = getTaskById(id);

        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task title is required");
        }
        if (dueDate == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Due date is required");
        }

        task.setTitle(title.trim());
        task.setDueDate(dueDate);
        task.setPriority(parsePriority(priority));

        return taskRepository.save(task);
    }

    // ================= DELETE TASK =================

    public void deleteTask(Long id) {

        if (!taskRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Task with ID " + id + " not found");
        }

        taskRepository.deleteById(id);
    }

    // ================= COMPLETE TASK =================

    public Task completeTask(Long id) {

        Task task = getTaskById(id);

        task.setCompleted(true);

        return taskRepository.save(task);
    }

    public Task incompleteTask(Long id) {
        Task task = getTaskById(id);
        task.setCompleted(false);
        return taskRepository.save(task);
    }

    // ================= MOVE TASK =================

    public Task moveTask(
            Long id,
            Long taskListId) {

        Task task = getTaskById(id);

        TaskList taskList = taskListRepository
                .findById(taskListId)
                .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Task list with ID " + taskListId + " not found"));

        task.setTaskList(taskList);

        return taskRepository.save(task);
    }

    // ================= OVERDUE TASKS =================

    public List<Task> getOverdueTasks() {

        return taskRepository.findByCompletedFalseAndDueDateBefore(LocalDate.now());
    }

    public List<Task> getTasksDueToday() {
        return taskRepository.findByDueDate(LocalDate.now());
    }

    private Priority parsePriority(String value) {
        if (value == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Priority must be LOW, MEDIUM or HIGH");
        }
        try {
            return Priority.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Priority must be LOW, MEDIUM or HIGH");
        }
    }
}