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
@Table(name = "reminders")
public class Reminder {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private long id;

	@ManyToOne(optional = false)
	@JoinColumn(name = "student_id", nullable = false)
	private Student student;

	@Column(nullable = false, length = 100)
	private String title;

	@Column(columnDefinition = "TEXT")
	private String description;

	@Column(name = "reminder_date", nullable = false)
	private LocalDate reminderDate;

	@Column(name = "reminder_time")
	private LocalTime reminderTime;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private Recurring recurring = Recurring.None;

	public enum Recurring {
		None, Daily, Weekly
	}
}
