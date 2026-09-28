package com.service;

import com.personal.entity.Priority;
import com.personal.entity.Task;
import com.personal.entity.TaskList;
import com.personal.repository.TaskListRepository;
import com.personal.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

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

    public Task createTask(
            String title,
            LocalDate dueDate,
            String priority,
            Boolean completed,
            Long taskListId) {

        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException(
                    "Task title is required");
        }

        if (dueDate == null) {
            throw new RuntimeException(
                    "Due date is required");
        }

        Priority taskPriority;

        try {
            taskPriority =
                    Priority.valueOf(priority.toUpperCase());
        } catch (Exception e) {

            throw new RuntimeException(
                    "Priority must be LOW, MEDIUM or HIGH");
        }

        TaskList taskList =
                taskListRepository.findById(taskListId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Task list with ID "
                                                + taskListId
                                                + " not found"));

        Task task = new Task();

        task.setTitle(title);
        task.setDueDate(dueDate);
        task.setPriority(taskPriority);
        task.setCompleted(
                completed != null && completed);
        task.setTaskList(taskList);

        return taskRepository.save(task);
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task getTaskById(Long id) {

        return taskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Task with ID "
                                        + id
                                        + " not found"));
    }

    public Task updateTask(
            Long id,
            String title,
            LocalDate dueDate,
            String priority) {

        Task task = getTaskById(id);

        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException(
                    "Task title is required");
        }

        Priority taskPriority;

        try {
            taskPriority =
                    Priority.valueOf(priority.toUpperCase());
        } catch (Exception e) {

            throw new RuntimeException(
                    "Priority must be LOW, MEDIUM or HIGH");
        }

        task.setTitle(title);
        task.setDueDate(dueDate);
        task.setPriority(taskPriority);

        return taskRepository.save(task);
    }

    public Task completeTask(Long id) {

        Task task = getTaskById(id);

        task.setCompleted(true);

        return taskRepository.save(task);
    }

    public Task moveTask(
            Long taskId,
            Long taskListId) {

        Task task = getTaskById(taskId);

        TaskList newTaskList =
                taskListRepository.findById(taskListId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Task list with ID "
                                                + taskListId
                                                + " not found"));

        task.setTaskList(newTaskList);

        return taskRepository.save(task);
    }

    public List<Task> getOverdueTasks() {

        return taskRepository
                .findByCompletedFalseAndDueDateBefore(
                        LocalDate.now());
    }

    public void deleteTask(Long id) {

        if (!taskRepository.existsById(id)) {

            throw new RuntimeException(
                    "Task with ID "
                            + id
                            + " not found");
        }

        taskRepository.deleteById(id);
    }
}