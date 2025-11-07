package com.collegeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;
import com.collegeplanner.repository.StudentRepository;
import java.time.LocalDate;

import com.collegeplanner.model.Semester;
import com.collegeplanner.repository.SemesterRepository;
import com.collegeplanner.model.Student;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequiredArgsConstructor
public class SemesterController {
	private final SemesterRepository semesterRepository;
    @Autowired
    private StudentRepository studentRepository;

	@GetMapping("/mySemesters")
	public List<Semester> getSemestersDetails(@RequestParam long id) {
		List<Semester> semesters = semesterRepository.findByStudentId(id);
		if (semesters != null) {
			return semesters;
		} else {
			return null;
		}
	}

	@PostMapping("/mySemesters")
    public ResponseEntity<Semester> saveSemester(@RequestBody SemesterDto semesterDto) {
        // Fetch the student
        Student student = studentRepository.findById(semesterDto.studentId);
        if (student == null) {
            return ResponseEntity.badRequest().build();
        }
        Semester.Term termEnum;
        try {
            termEnum = Semester.Term.valueOf(semesterDto.term);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
        Semester semester = new Semester();
        semester.setStudent(student);
        semester.setYear(semesterDto.year);
        semester.setTerm(termEnum);
        semester.setStartDate(LocalDate.parse(semesterDto.startDate));
        semester.setEndDate(LocalDate.parse(semesterDto.endDate));
        Semester saved = semesterRepository.save(semester);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/mySemesters")
    public ResponseEntity<Semester> updateSemester(@RequestBody SemesterDto semesterDto) {
        // Fetch the semester by id (assume id is provided in DTO)
        if (semesterDto.id == 0) {
            return ResponseEntity.badRequest().build();
        }
        Semester semester = semesterRepository.findById(semesterDto.id).orElse(null);
        if (semester == null) {
            return ResponseEntity.notFound().build();
        }
        // Optionally update student if studentId is provided
        if (semesterDto.studentId != 0) {
            Student student = studentRepository.findById(semesterDto.studentId);
            if (student == null) {
                return ResponseEntity.badRequest().build();
            }
            semester.setStudent(student);
        }
        if (semesterDto.year != 0) semester.setYear(semesterDto.year);
        if (semesterDto.term != null) {
            try {
                semester.setTerm(Semester.Term.valueOf(semesterDto.term));
            } catch (Exception e) {
                return ResponseEntity.badRequest().build();
            }
        }
        if (semesterDto.startDate != null) semester.setStartDate(LocalDate.parse(semesterDto.startDate));
        if (semesterDto.endDate != null) semester.setEndDate(LocalDate.parse(semesterDto.endDate));
        Semester updated = semesterRepository.save(semester);
        return ResponseEntity.ok(updated);
    }

    // DTO for Semester POST
    public static class SemesterDto {
        public long studentId;
        public int year;
        public String term;
        public String startDate;
        public String endDate;
        public long id;
    }

	//	public Semesters getStudentDetailsAfterLogin(Authentication authentication) {
	//		Semesters mySemesters = semestersRepository.findByStudentId(0).findByEmail(authentication.getName());
	//		List<Loans> loans = loanRepository.findByCustomerIdOrderByStartDtDesc(id);
	//		if (loans != null) {
	//			return loans;
	//		} else {
	//			return null;
	//		}
	//	}

}
