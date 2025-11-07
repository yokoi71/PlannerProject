package com.collegeplanner.controller;

import java.time.LocalTime;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.collegeplanner.model.CourseWeeklySchedule;
import com.collegeplanner.model.CourseWeeklySchedule.DayOfWeek;
import com.collegeplanner.repository.CourseRepository;
import com.collegeplanner.repository.CourseWeeklyScheduleRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CourseWeeklyScheduleController {
	private final CourseWeeklyScheduleRepository courseWeeklyScheduleRepository;
	private final CourseRepository courseRepository;

	@GetMapping("/myCourseWeeklySchedule")
	public List<CourseWeeklySchedule> getCourseWeeklyScheduleDetails(@RequestParam long id) {
		List<CourseWeeklySchedule> courseWeeklySchedules = courseWeeklyScheduleRepository.findByCourseId(id);
		if (courseWeeklySchedules != null) {
			return courseWeeklySchedules;
		} else {
			return null;
		}
	}

	@PostMapping("/addCourseWeeklySchedule")
	public CourseWeeklySchedule addCourseWeeklySchedule(@RequestBody CourseWeeklyScheduleRequest request) {
		// Find the course by ID
		com.collegeplanner.model.Course course = courseRepository.findById(request.getCourseId())
				.orElseThrow(() -> new RuntimeException("Course not found with id: " + request.getCourseId()));

		// Create new course weekly schedule
		CourseWeeklySchedule schedule = new CourseWeeklySchedule();
		schedule.setCourse(course);
		schedule.setDayOfWeek(DayOfWeek.valueOf(request.getDayOfWeek()));
		schedule.setStartTime(LocalTime.parse(request.getStartTime()));
		schedule.setEndTime(LocalTime.parse(request.getEndTime()));

		// Save and return the schedule
		return courseWeeklyScheduleRepository.save(schedule);
	}

	@DeleteMapping("/deleteCourseWeeklySchedule/{courseId}")
	@Transactional
	public void deleteCourseWeeklySchedules(@PathVariable long courseId) {
		courseWeeklyScheduleRepository.deleteByCourseId(courseId);
	}

	// Inner class for request body
	public static class CourseWeeklyScheduleRequest {
		private long courseId;
		private String dayOfWeek;
		private String startTime;
		private String endTime;

		// Getters and setters
		public long getCourseId() { return courseId; }
		public void setCourseId(long courseId) { this.courseId = courseId; }
		
		public String getDayOfWeek() { return dayOfWeek; }
		public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }
		
		public String getStartTime() { return startTime; }
		public void setStartTime(String startTime) { this.startTime = startTime; }
		
		public String getEndTime() { return endTime; }
		public void setEndTime(String endTime) { this.endTime = endTime; }
	}
}
