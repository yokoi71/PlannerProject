package com.collegeplanner.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.collegeplanner.model.Exam;
import com.collegeplanner.repository.ExamRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ExamController {

	private final ExamRepository examRepository;

	// Get exams by course ID - matches frontend expectation
	@GetMapping("/myExams")
	public List<Exam> getExamsDetails(@RequestParam long courseId) {
		List<Exam> exams = examRepository.findByCourseId(courseId);
		if (exams != null) {
			return exams;
		} else {
			return null;
		}
	}



	// Create a new exam
	@PostMapping("/myExams")
	public ResponseEntity<Exam> createExam(@RequestBody Exam exam) {
		Exam savedExam = examRepository.save(exam);
		return ResponseEntity.ok(savedExam);
	}

	// Update an exam
	@PutMapping("/myExams")
	public ResponseEntity<Exam> updateExam(@RequestBody Exam exam) {
		if (examRepository.existsById(exam.getId())) {
			Exam updatedExam = examRepository.save(exam);
			return ResponseEntity.ok(updatedExam);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	// Delete an exam
	@DeleteMapping("/myExams/{id}")
	public ResponseEntity<Void> deleteExam(@PathVariable long id) {
		if (examRepository.existsById(id)) {
			examRepository.deleteById(id);
			return ResponseEntity.ok().build();
		} else {
			return ResponseEntity.notFound().build();
		}
	}
}
