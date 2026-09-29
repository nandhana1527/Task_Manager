package com.personal.task_manager.repository;

import com.personal.entity.TaskList;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskListRepository extends JpaRepository<TaskList, Long> {
}