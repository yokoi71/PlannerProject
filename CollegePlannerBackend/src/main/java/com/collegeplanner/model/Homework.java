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
@Table(name = "homework")
public class Homework {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "course_id", nullable = false)
	private Course course;

	@Column(nullable = false, length = 100)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "due_date", nullable = false)
	private LocalDate dueDate;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Status status = Status.Pending;

	@Column(name = "reminder_days_before", nullable = false)
	private Integer reminderDaysBefore = 0;

	public enum Status {
		Pending, Completed
	}
}
