package com.collegeplanner.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.collegeplanner.model.Holiday;
import com.collegeplanner.model.Student;
import com.collegeplanner.repository.HolidayRepository;
import com.collegeplanner.repository.StudentRepository;

@RestController
public class HolidayController {
    @Autowired
    private HolidayRepository holidayRepository;
    @Autowired
    private StudentRepository studentRepository;

	//    @GetMapping
	//    public List<Holiday> getAllHolidays() {
	//        return holidayRepository.findAll();
	//    }
	//
	//    @GetMapping("/{id}")
	//    public Holiday getHolidayById(@PathVariable Long id) {
	//        return holidayRepository.findById(id).orElse(null);
	//    }


    @GetMapping("/myHolidays")
	public List<Holiday> getHolidays(@RequestParam long studentId) {
		List<Holiday> holidays = holidayRepository.findByStudentId(studentId);
		if (holidays != null) {
			return holidays;
		} else {
			return null;
		}
	}

    @PostMapping("/myHolidays")
    public ResponseEntity<Holiday> addHoliday(@RequestBody HolidayDto dto) {
        Student student = studentRepository.findById(dto.studentId);
        if (student == null) return ResponseEntity.badRequest().build();
        Holiday holiday = new Holiday();
        holiday.setStudent(student);
        holiday.setTitle(dto.title);
        holiday.setYear(dto.year);
        holiday.setStartDate(LocalDate.parse(dto.startDate));
        holiday.setEndDate(LocalDate.parse(dto.endDate));
        Holiday saved = holidayRepository.save(holiday);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/myHolidays")
    public ResponseEntity<Holiday> updateHoliday(@RequestBody HolidayDto dto) {
        if (dto.id == 0) return ResponseEntity.badRequest().build();
        Holiday holiday = holidayRepository.findById(dto.id).orElse(null);
        if (holiday == null) return ResponseEntity.notFound().build();
        if (dto.studentId != 0) {
            Student student = studentRepository.findById(dto.studentId);
            if (student == null) return ResponseEntity.badRequest().build();
            holiday.setStudent(student);
        }
        if (dto.title != null) holiday.setTitle(dto.title);
        if (dto.year != 0) holiday.setYear(dto.year);
        if (dto.startDate != null) holiday.setStartDate(LocalDate.parse(dto.startDate));
        if (dto.endDate != null) holiday.setEndDate(LocalDate.parse(dto.endDate));
        Holiday updated = holidayRepository.save(holiday);
        return ResponseEntity.ok(updated);
    }

	@DeleteMapping("/myHolidays/{id}")
    public void deleteHoliday(@PathVariable Long id) {
        holidayRepository.deleteById(id);
    }

    public static class HolidayDto {
        public long id;
        public long studentId;
        public String title;
        public int year;
        public String startDate;
        public String endDate;
    }
} 