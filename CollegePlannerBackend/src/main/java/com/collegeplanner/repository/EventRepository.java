package com.collegeplanner.repository;

import com.collegeplanner.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByStudentId(long studentId);
} 