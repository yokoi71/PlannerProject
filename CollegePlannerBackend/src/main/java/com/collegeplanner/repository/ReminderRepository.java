package com.collegeplanner.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.Reminder;

@Repository
public interface ReminderRepository extends CrudRepository<Reminder, Long> {
	List<Reminder> findByStudentId(long studentId);
}