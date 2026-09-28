package com.controller;

import com.personal.entity.Task;
import com.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public Task createTask(
            @RequestParam String title,
            @RequestParam String dueDate,
            @RequestParam String priority,
            @RequestParam(required = false) Boolean completed,
            @RequestParam Long taskListId) {

        return taskService.createTask(
                title,
                LocalDate.parse(dueDate),
                priority,
                completed,
                taskListId
        );
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
    }

    // IMPORTANT: /overdue comes before /{id}
    @GetMapping("/overdue")
    public List<Task> getOverdueTasks() {

        return taskService.getOverdueTasks();
    }

    @GetMapping("/{id}")
    public Task getTaskById(
            @PathVariable Long id) {

        return taskService.getTaskById(id);
    }

    @PutMapping("/{id}")
    public Task updateTask(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String dueDate,
            @RequestParam String priority) {

        return taskService.updateTask(
                id,
                title,
                LocalDate.parse(dueDate),
                priority
        );
    }

    @DeleteMapping("/{id}")
    public String deleteTask(
            @PathVariable Long id) {

        taskService.deleteTask(id);

        return "Task deleted successfully";
    }

    @PutMapping("/{id}/complete")
    public Task completeTask(
            @PathVariable Long id) {

        return taskService.completeTask(id);
    }

    @PutMapping("/{id}/move")
    public Task moveTask(
            @PathVariable Long id,
            @RequestParam Long taskListId) {

        return taskService.moveTask(
                id,
                taskListId
        );
    }
}