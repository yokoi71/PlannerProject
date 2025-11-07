package com.collegeplanner.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.Student;

@Repository
public interface StudentRepository extends CrudRepository<Student, Long> {

	Student findByEmail(String email);

	Student findById(long id);
}
/*
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
	name VARCHAR(100) NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    school_name VARCHAR(150) NOT NULL,
    grade ENUM('Freshman', 'Sophomore', 'Junior', 'Senior') NOT NULL
);
*/