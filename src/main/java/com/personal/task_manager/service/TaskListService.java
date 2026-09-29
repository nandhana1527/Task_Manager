package com.personal.task_manager.service;

import com.personal.entity.TaskList;
import com.personal.entity.User;
import com.personal.task_manager.repository.TaskListRepository;
import com.personal.task_manager.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TaskListService {

    private final TaskListRepository taskListRepository;
    private final UserRepository userRepository;

    public TaskListService(
            TaskListRepository taskListRepository,
            UserRepository userRepository) {

        this.taskListRepository = taskListRepository;
        this.userRepository = userRepository;
    }

    public TaskList createTaskList(
            String name,
            Long userId) {

        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task list name is required");
        }
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "User with ID " + userId + " not found"));

        TaskList taskList = new TaskList();

        taskList.setName(name.trim());
        taskList.setUser(user);

        return taskListRepository.save(taskList);
    }

    public List<TaskList> getAllTaskLists() {
        return taskListRepository.findAll();
    }

    public TaskList getTaskListById(Long id) {

        return taskListRepository.findById(id)
                .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Task list with ID " + id + " not found"));
    }

    public TaskList updateTaskList(
            Long id,
            String name) {

        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Task list name is required");
        }
        TaskList taskList = getTaskListById(id);

        taskList.setName(name.trim());

        return taskListRepository.save(taskList);
    }

    public void deleteTaskList(Long id) {

        if (!taskListRepository.existsById(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Task list with ID " + id + " not found");
        }

        taskListRepository.deleteById(id);
    }
}