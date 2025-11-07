package com.collegeplanner.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "semesters")
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false)
    private Integer year;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Term term;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    // Enum for term values
    public enum Term {
        Spring, Summer, Fall, Winter
    }

    // Constructors
	public Semester() {
	}

	public Semester(Student student, Integer year, Term term, LocalDate startDate, LocalDate endDate) {
		this.student = student;
        this.year = year;
        this.term = term;
        this.startDate = startDate;
        this.endDate = endDate;
    }

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