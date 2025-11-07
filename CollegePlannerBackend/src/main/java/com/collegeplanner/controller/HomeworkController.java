package com.collegeplanner.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.collegeplanner.model.Course;
import com.collegeplanner.model.Homework;
import com.collegeplanner.repository.CourseRepository;
import com.collegeplanner.repository.HomeworkRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class HomeworkController {
	private final HomeworkRepository homeworkRepository;
	private final CourseRepository courseRepository;

	// Get homework by course ID - matches frontend expectation
	@GetMapping("/myHomework")
	public List<Homework> getHomeworkDetails(@RequestParam long courseId) {
		List<Homework> homework = homeworkRepository.findHomeworkByCourseId(courseId);
		if (homework != null) {
			return homework;
		} else {
			return null;
		}
	}

	// Get all homework
	@GetMapping("/homework")
	public List<Homework> getAllHomework() {
		return (List<Homework>) homeworkRepository.findAll();
	}

	// Get a specific homework by ID
	@GetMapping("/homework/{id}")
	public ResponseEntity<Homework> getHomeworkById(@PathVariable long id) {
		Optional<Homework> homework = homeworkRepository.findById(id);
		return homework.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	}

	// Create a new homework
	@PostMapping("/myHomework")
	public ResponseEntity<Homework> createHomework(@RequestBody HomeworkRequest homeworkRequest) {
		// Find the course by ID
		Course course = courseRepository.findById(homeworkRequest.getCourseId())
			.orElseThrow(() -> new RuntimeException("Course not found with id: " + homeworkRequest.getCourseId()));
		
		// Create new homework entity
		Homework homework = new Homework();
		homework.setCourse(course);
		homework.setTitle(homeworkRequest.getTitle());
		homework.setDescription(homeworkRequest.getDescription());
		homework.setDueDate(LocalDate.parse(homeworkRequest.getDueDate()));
		homework.setStatus(Homework.Status.valueOf(homeworkRequest.getStatus()));
		homework.setReminderDaysBefore(homeworkRequest.getReminderDaysBefore());
		
		Homework savedHomework = homeworkRepository.save(homework);
		return ResponseEntity.ok(savedHomework);
	}

	// Update an existing homework
	@PutMapping("/myHomework")
	public ResponseEntity<Homework> updateHomework(@RequestBody Homework homework) {
		if (homeworkRepository.existsById(homework.getId())) {
			Homework updatedHomework = homeworkRepository.save(homework);
			return ResponseEntity.ok(updatedHomework);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	// Delete a homework
	@DeleteMapping("/myHomework/{id}")
	public ResponseEntity<Void> deleteHomework(@PathVariable long id) {
		if (homeworkRepository.existsById(id)) {
			homeworkRepository.deleteById(id);
			return ResponseEntity.ok().build();
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	// DTO class for homework requests from frontend
	public static class HomeworkRequest {
		private long courseId;
		private String title;
		private String description;
		private String dueDate;
		private String status;
		private int reminderDaysBefore;

		// Getters and setters
		public long getCourseId() { return courseId; }
		public void setCourseId(long courseId) { this.courseId = courseId; }
		
		public String getTitle() { return title; }
		public void setTitle(String title) { this.title = title; }
		
		public String getDescription() { return description; }
		public void setDescription(String description) { this.description = description; }
		
		public String getDueDate() { return dueDate; }
		public void setDueDate(String dueDate) { this.dueDate = dueDate; }
		
		public String getStatus() { return status; }
		public void setStatus(String status) { this.status = status; }
		
		public int getReminderDaysBefore() { return reminderDaysBefore; }
		public void setReminderDaysBefore(int reminderDaysBefore) { this.reminderDaysBefore = reminderDaysBefore; }
	}
}
