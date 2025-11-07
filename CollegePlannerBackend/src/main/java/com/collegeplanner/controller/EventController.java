package com.collegeplanner.controller;

import java.time.LocalDate;
import java.time.LocalTime;
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

import com.collegeplanner.model.Event;
import com.collegeplanner.model.Student;
import com.collegeplanner.repository.EventRepository;
import com.collegeplanner.repository.StudentRepository;

@RestController
public class EventController {
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private StudentRepository studentRepository;

    @GetMapping("/events")
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @GetMapping("/event/{id}")
    public Event getEventById(@PathVariable Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return eventRepository.save(event);
    }

    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable Long id, @RequestBody Event event) {
        event.setId(id);
        return eventRepository.save(event);
    }

	@DeleteMapping("/myEvents/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventRepository.deleteById(id);
    }

    @GetMapping("/myEvents")
	public List<Event> getHolidays(@RequestParam long studentId) {
		List<Event> events = eventRepository.findByStudentId(studentId);
		if (events != null) {
			return events;
		} else {
			return null;
		}
	}

    @PostMapping("/myEvents")
    public ResponseEntity<Event> addEvent(@RequestBody EventDto dto) {
        Student student = studentRepository.findById(dto.studentId);
        if (student == null) return ResponseEntity.badRequest().build();
        Event event = new Event();
        event.setStudent(student);
        event.setTitle(dto.title);
        event.setStartDate(LocalDate.parse(dto.startDate));
        event.setEndDate(LocalDate.parse(dto.endDate));
        if (dto.startTime != null) event.setStartTime(LocalTime.parse(dto.startTime));
        if (dto.endTime != null) event.setEndTime(LocalTime.parse(dto.endTime));
        event.setLocation(dto.location);
        event.setNotes(dto.notes);
        event.setReminderDaysBefore(dto.reminderDaysBefore);
        Event saved = eventRepository.save(event);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/myEvents")
    public ResponseEntity<Event> updateEvent(@RequestBody EventDto dto) {
        if (dto.id == 0) return ResponseEntity.badRequest().build();
        Event event = eventRepository.findById(dto.id).orElse(null);
        if (event == null) return ResponseEntity.notFound().build();
        if (dto.studentId != 0) {
            Student student = studentRepository.findById(dto.studentId);
            if (student == null) return ResponseEntity.badRequest().build();
            event.setStudent(student);
        }
        if (dto.title != null) event.setTitle(dto.title);
        if (dto.startDate != null) event.setStartDate(LocalDate.parse(dto.startDate));
        if (dto.endDate != null) event.setEndDate(LocalDate.parse(dto.endDate));
        if (dto.startTime != null) event.setStartTime(LocalTime.parse(dto.startTime));
        if (dto.endTime != null) event.setEndTime(LocalTime.parse(dto.endTime));
        if (dto.location != null) event.setLocation(dto.location);
        if (dto.notes != null) event.setNotes(dto.notes);
        if (dto.reminderDaysBefore != null) event.setReminderDaysBefore(dto.reminderDaysBefore);
        Event updated = eventRepository.save(event);
        return ResponseEntity.ok(updated);
    }

    public static class EventDto {
        public long id;
        public long studentId;
        public String title;
        public String startDate;
        public String endDate;
        public String startTime;
        public String endTime;
        public String location;
        public String notes;
        public Integer reminderDaysBefore;
    }
} 