package com.service;

import com.personal.entity.TaskList;
import com.personal.entity.User;
import com.personal.repository.TaskListRepository;
import com.personal.repository.UserRepository;
import org.springframework.stereotype.Service;

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

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User with ID " + userId + " not found"));

        TaskList taskList = new TaskList();

        taskList.setName(name);
        taskList.setUser(user);

        return taskListRepository.save(taskList);
    }

    public List<TaskList> getAllTaskLists() {
        return taskListRepository.findAll();
    }

    public TaskList getTaskListById(Long id) {

        return taskListRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Task list with ID " + id + " not found"));
    }

    public TaskList updateTaskList(
            Long id,
            String name) {

        TaskList taskList = getTaskListById(id);

        taskList.setName(name);

        return taskListRepository.save(taskList);
    }

    public void deleteTaskList(Long id) {

        if (!taskListRepository.existsById(id)) {
            throw new RuntimeException(
                    "Task list with ID " + id + " not found");
        }

        taskListRepository.deleteById(id);
    }
}