package com.collegeplanner.model;

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
@Setter
@Getter
@Table(name = "course_weekly_schedule")
public class CourseWeeklySchedule {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private long id;

	    @ManyToOne(optional = false)
	    @JoinColumn(name = "course_id", nullable = false)
	    private Course course;

	    @Column(name = "day_of_week", nullable = false)
	    @Enumerated(EnumType.STRING)
	    private DayOfWeek dayOfWeek;

	    @Column(name = "start_time", nullable = false)
	    private LocalTime startTime;

	    @Column(name = "end_time", nullable = false)
	    private LocalTime endTime;

	    public enum DayOfWeek {
	        Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
	    }
}

/*
CREATE TABLE course_weekly_schedule (
id INT PRIMARY KEY AUTO_INCREMENT,
course_id INT NOT NULL,
day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
start_time TIME NOT NULL,
end_time TIME NOT NULL,
FOREIGN KEY (course_id) REFERENCES course(id)
);
*/