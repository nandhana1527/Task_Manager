package com.personal.task_manager.repository;

import com.personal.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
	List<Task> findByCompletedFalseAndDueDateBefore(LocalDate date);

	List<Task> findByDueDate(LocalDate date);
}