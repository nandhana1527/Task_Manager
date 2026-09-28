package com.controller;

import com.personal.entity.TaskList;
import com.service.TaskListService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasklists")
public class TaskListController {

    private final TaskListService taskListService;

    public TaskListController(TaskListService taskListService) {
        this.taskListService = taskListService;
    }

    @PostMapping
    public TaskList createTaskList(
            @RequestParam String name,
            @RequestParam Long userId) {

        return taskListService.createTaskList(
                name,
                userId
        );
    }

    @GetMapping
    public List<TaskList> getAllTaskLists() {
        return taskListService.getAllTaskLists();
    }

    @GetMapping("/{id}")
    public TaskList getTaskListById(
            @PathVariable Long id) {

        return taskListService.getTaskListById(id);
    }

    @PutMapping("/{id}")
    public TaskList updateTaskList(
            @PathVariable Long id,
            @RequestParam String name) {

        return taskListService.updateTaskList(
                id,
                name
        );
    }

    @DeleteMapping("/{id}")
    public String deleteTaskList(
            @PathVariable Long id) {

        taskListService.deleteTaskList(id);

        return "Task list deleted successfully";
    }
}