package com.personal.task_manager.controller;

import com.personal.entity.User;
import com.personal.task_manager.service.UserService;

import jakarta.validation.constraints.Positive;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.annotation.Validated;

import java.net.URI;
import java.util.List;

@RestController
@Validated
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User createdUser = userService.createUser(user);
        return ResponseEntity.created(URI.create("/api/users/" + createdUser.getId())).body(createdUser);
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable @Positive Long id) {
        return userService.getUserById(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable @Positive Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}