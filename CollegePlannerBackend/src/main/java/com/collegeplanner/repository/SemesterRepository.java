package com.collegeplanner.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.Semester;

@Repository
public interface SemesterRepository extends CrudRepository<Semester, Long> {

	List<Semester> findByStudentId(long studentId);
}

/*
CREATE TABLE semesters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    year YEAR NOT NULL,
    term ENUM('Spring', 'Summer', 'Fall', 'Winter') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
);
*/