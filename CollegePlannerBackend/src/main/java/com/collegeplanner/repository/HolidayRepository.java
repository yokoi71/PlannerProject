package com.collegeplanner.repository;

import com.collegeplanner.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    List<Holiday> findByStudentId(long studentId);
} 