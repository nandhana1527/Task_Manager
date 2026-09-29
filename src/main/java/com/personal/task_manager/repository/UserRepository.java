package com.personal.task_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.personal.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}