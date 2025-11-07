package com.collegeplanner.model;

import java.time.LocalDate;
import java.time.LocalTime;

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
@Table(name = "exams")
public class Exam {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "course_id", nullable = false)
	private Course course;

	@Enumerated(EnumType.STRING)
	@Column(name = "exam_type", nullable = false)
	private ExamType examType = ExamType.Other;

	@Column(name = "exam_date", nullable = false)
	private LocalDate examDate;

	@Column(name = "start_time")
	private LocalTime startTime;

	@Column(name = "end_time")
	private LocalTime endTime;

	@Column(length = 100)
	private String location;

	@Column(name = "reminder_days_before", nullable = false)
	private Integer reminderDaysBefore = 0;

	public enum ExamType {
		Midterm, Final, Quiz, Other
	}
}
