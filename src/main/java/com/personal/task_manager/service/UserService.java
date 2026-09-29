package com.personal.task_manager.service;

import com.personal.entity.User;
import com.personal.task_manager.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() ->
                new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "User with ID " + id + " not found"));
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "User with ID " + id + " not found");
        }

        userRepository.deleteById(id);
    }
}