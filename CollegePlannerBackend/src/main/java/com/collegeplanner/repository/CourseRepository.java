package com.collegeplanner.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.Course;


@Repository
public interface CourseRepository extends CrudRepository<Course, Long> {

	List<Course> findBySemesterId(long semesterId);
}
/*
CREATE TABLE course (
id INT PRIMARY KEY AUTO_INCREMENT,
semester_id INT NOT NULL,
course_name VARCHAR(100) NOT NULL,
professor_name VARCHAR(100),
room VARCHAR(50),
FOREIGN KEY (semester_id) REFERENCES semesters(id)
);
*/