package com.collegeplanner.controller;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.collegeplanner.model.Customer;
import com.collegeplanner.model.Student;
import com.collegeplanner.repository.CustomerRepository;
import com.collegeplanner.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class StudentController {

	private final StudentRepository studentRepository;
	private final CustomerRepository customerRepository;

	@GetMapping("/myStudentInfo")
	public Student getStudentInfo(@RequestParam long id) {
		Student student = studentRepository.findById(id);
		if (student != null) {
			return student;
		} else {
			// If no student record exists, try to create one from customer data
			Optional<Customer> customer = customerRepository.findById(id);
			if (customer.isPresent()) {
				// Create a new student record from customer data
				Student newStudent = new Student();
				newStudent.setName(customer.get().getName());
				newStudent.setEmail(customer.get().getEmail());
				// Set default values for required fields
				newStudent.setDateOfBirth(LocalDate.now().minusYears(18)); // Default to 18 years ago
				newStudent.setGender(Student.Gender.Other); // Default gender
				newStudent.setSchoolName(""); // Empty school name
				newStudent.setGrade(Student.Grade.Freshman); // Default grade
				
				// Save the new student record
				Student savedStudent = studentRepository.save(newStudent);
				return savedStudent;
			}
			return null;
		}
	}

	@PutMapping("/updateStudentInfo")
	public ResponseEntity<Student> updateStudentInfo(@RequestBody Student updatedStudent) {
		Student existingStudent = studentRepository.findById(updatedStudent.getId());
		if (existingStudent != null) {
			// Update the fields
			existingStudent.setName(updatedStudent.getName());
			existingStudent.setEmail(updatedStudent.getEmail());
			existingStudent.setDateOfBirth(updatedStudent.getDateOfBirth());
			existingStudent.setGender(updatedStudent.getGender());
			existingStudent.setSchoolName(updatedStudent.getSchoolName());
			existingStudent.setGrade(updatedStudent.getGrade());
			
			Student savedStudent = studentRepository.save(existingStudent);
			return ResponseEntity.ok(savedStudent);
		} else {
			// If student doesn't exist, create a new one
			Student newStudent = new Student();
			newStudent.setName(updatedStudent.getName());
			newStudent.setEmail(updatedStudent.getEmail());
			newStudent.setDateOfBirth(updatedStudent.getDateOfBirth());
			newStudent.setGender(updatedStudent.getGender());
			newStudent.setSchoolName(updatedStudent.getSchoolName());
			newStudent.setGrade(updatedStudent.getGrade());
			
			Student savedStudent = studentRepository.save(newStudent);
			return ResponseEntity.ok(savedStudent);
		}
	}

//	public Student getStudentDetailsAfterLogin(Authentication authentication) {
//		Student optionalStudent = studentRepository.findByEmail(authentication.getName());
//		if (optionalStudent != null) {
//			return optionalStudent;
//		} else {
//			return null;
//		}
//	}

}