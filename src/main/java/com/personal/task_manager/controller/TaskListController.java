package com.personal.task_manager.controller;

import com.personal.entity.TaskList;
import com.personal.task_manager.service.TaskListService;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import java.net.URI;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/tasklists")
public class TaskListController {

    private final TaskListService taskListService;

    public TaskListController(TaskListService taskListService) {
        this.taskListService = taskListService;
    }

    @PostMapping
    public ResponseEntity<TaskList> createTaskList(
            @RequestParam @NotBlank @Size(max = 255) String name,
            @RequestParam @NotNull @Positive Long userId) {

        TaskList taskList = taskListService.createTaskList(
                name,
                userId
        );
        return ResponseEntity.created(URI.create("/api/tasklists/" + taskList.getId())).body(taskList);
    }

    @GetMapping
    public List<TaskList> getAllTaskLists() {
        return taskListService.getAllTaskLists();
    }

    @GetMapping("/{id}")
    public TaskList getTaskListById(
            @PathVariable @Positive Long id) {

        return taskListService.getTaskListById(id);
    }

    @PutMapping("/{id}")
        public TaskList updateTaskList(
            @PathVariable @Positive Long id,
            @RequestParam @NotBlank @Size(max = 255) String name) {

        return taskListService.updateTaskList(
                id,
                name
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTaskList(
            @PathVariable @Positive Long id) {

        taskListService.deleteTaskList(id);
        return ResponseEntity.noContent().build();
    }
}