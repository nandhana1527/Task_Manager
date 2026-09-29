package com.personal.task_manager.controller;

import com.personal.entity.Task;
import com.personal.task_manager.service.TaskService;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<Task> createTask(
            @RequestParam @NotBlank @Size(max = 255) String title,
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam @NotBlank String priority,
            @RequestParam(required = false) Boolean completed,
            @RequestParam @NotNull @Positive Long taskListId) {

        Task task = taskService.createTask(
                title,
                dueDate,
                priority,
                completed,
                taskListId
        );
        return ResponseEntity.created(URI.create("/api/tasks/" + task.getId())).body(task);
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

    @GetMapping("/today")
    public List<Task> getTasksDueToday() {
        return taskService.getTasksDueToday();
    }

    @GetMapping("/{id}")
    public Task getTaskById(
            @PathVariable @Positive Long id) {

        return taskService.getTaskById(id);
    }

    @PutMapping("/{id}")
    public Task updateTask(
            @PathVariable @Positive Long id,
            @RequestParam @NotBlank @Size(max = 255) String title,
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam @NotBlank String priority) {

        return taskService.updateTask(
                id,
                title,
                dueDate,
                priority
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable @Positive Long id) {

        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/complete")
    public Task completeTask(
            @PathVariable @Positive Long id) {

        return taskService.completeTask(id);
    }

    @PutMapping("/{id}/incomplete")
    public Task incompleteTask(
            @PathVariable @Positive Long id) {
        return taskService.incompleteTask(id);
    }

    @PutMapping("/{id}/move")
    public Task moveTask(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long taskListId) {

        return taskService.moveTask(
                id,
                taskListId
        );
    }
}