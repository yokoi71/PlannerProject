package com.collegeplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "course")
public class Course {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "semester_id", nullable = false)
	private Semester semester;

	@Column(name = "course_name", nullable = false, length = 100)
	private String courseName;

	@Column(name = "professor_name", length = 100)
	private String professorName;

	@Column(name = "room", length = 50)
	private String room;
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