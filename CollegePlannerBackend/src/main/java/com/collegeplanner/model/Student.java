package com.collegeplanner.model;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "students")
public class Student {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private long id;

	@Column(name = "name")
	private String name;

	@Column(name = "email")
	private String email;

	@Column(name = "date_of_birth", nullable = false)
	private LocalDate dateOfBirth;


	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Gender gender;

	@Column(name = "school_name")
	private String schoolName;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Grade grade;

	@OneToMany(mappedBy = "student")
	@JsonIgnore
	private List<Reminder> reminders;

	@OneToMany(mappedBy = "student")
	@JsonIgnore
	private List<Event> events;

	@OneToMany(mappedBy = "student")
	@JsonIgnore
	private List<Holiday> holidays;

	// Enum for gender values
	public enum Gender {
		Male, Female, Other
	}

	// Enum for gender values
	public enum Grade {
		Freshman, Sophomore, Junior, Senior
	}
}

/*
CREATE TABLE students (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    school_name VARCHAR(150) NOT NULL,
    grade ENUM('Freshman', 'Sophomore', 'Junior', 'Senior') NOT NULL
);
*/