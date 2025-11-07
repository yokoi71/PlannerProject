package com.collegeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.collegeplanner.model.Course;
import com.collegeplanner.model.Semester;
import com.collegeplanner.repository.CourseRepository;
import com.collegeplanner.repository.CourseWeeklyScheduleRepository;
import com.collegeplanner.repository.SemesterRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CourseController {
	private final CourseRepository courseRepository;
	private final SemesterRepository semesterRepository;
	private final CourseWeeklyScheduleRepository courseWeeklyScheduleRepository;

	@GetMapping("/myCourses")
	public List<Course> getCourseDetails(@RequestParam long id) {
		List<Course> courses = courseRepository.findBySemesterId(id);
		if (courses != null) {
			return courses;
		} else {
			return null;
		}
	}

	@PostMapping("/addCourse")
	public Course addCourse(@RequestBody CourseRequest courseRequest) {
		// Find the semester by ID
		Semester semester = semesterRepository.findById(courseRequest.getSemesterId())
				.orElseThrow(() -> new RuntimeException("Semester not found with id: " + courseRequest.getSemesterId()));

		// Create new course
		Course course = new Course();
		course.setSemester(semester);
		course.setCourseName(courseRequest.getCourseName());
		course.setProfessorName(courseRequest.getProfessorName());
		course.setRoom(courseRequest.getRoom());

		// Save and return the course
		return courseRepository.save(course);
	}

	@DeleteMapping("/deleteCourse/{courseId}")
	public void deleteCourse(@PathVariable long courseId) {
		// First delete all weekly schedules for this course
		courseWeeklyScheduleRepository.deleteByCourseId(courseId);
		// Then delete the course itself
		courseRepository.deleteById(courseId);
	}

	// Inner class for request body
	public static class CourseRequest {
		private long semesterId;
		private String courseName;
		private String professorName;
		private String room;

		// Getters and setters
		public long getSemesterId() { return semesterId; }
		public void setSemesterId(long semesterId) { this.semesterId = semesterId; }
		
		public String getCourseName() { return courseName; }
		public void setCourseName(String courseName) { this.courseName = courseName; }
		
		public String getProfessorName() { return professorName; }
		public void setProfessorName(String professorName) { this.professorName = professorName; }
		
		public String getRoom() { return room; }
		public void setRoom(String room) { this.room = room; }
	}
}