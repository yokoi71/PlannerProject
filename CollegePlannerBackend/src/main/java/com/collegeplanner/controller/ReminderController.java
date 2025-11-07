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

import com.collegeplanner.model.Reminder;
import com.collegeplanner.model.Student;
import com.collegeplanner.repository.ReminderRepository;
import com.collegeplanner.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ReminderController {

	private final ReminderRepository reminderRepository;
    @Autowired
    private StudentRepository studentRepository;

	// Get all reminders
	//	@GetMapping
	//	public List<Reminder> getAllReminders() {
	//		return reminderRepository.findAll();
	//	}

	// Get reminders by student ID
	@GetMapping("/student/{studentId}")
	public List<Reminder> getRemindersByStudent(@PathVariable long studentId) {
		return reminderRepository.findByStudentId(studentId);
	}

	@GetMapping("/myReminders")
    public List<Reminder> getReminders(@RequestParam long studentId) {
        return reminderRepository.findByStudentId(studentId);
    }

	@DeleteMapping("/myReminders/{id}")
	public void deleteReminder(@PathVariable Long id) {
		reminderRepository.deleteById(id);
	}

    @PostMapping("/myReminders")
    public ResponseEntity<Reminder> addReminder(@RequestBody ReminderDto dto) {
        Student student = studentRepository.findById(dto.studentId);
        if (student == null) return ResponseEntity.badRequest().build();
        Reminder reminder = new Reminder();
        reminder.setStudent(student);
        reminder.setTitle(dto.title);
        reminder.setDescription(dto.description);
        reminder.setReminderDate(LocalDate.parse(dto.reminderDate));
        if (dto.reminderTime != null) reminder.setReminderTime(LocalTime.parse(dto.reminderTime));
        if (dto.recurring != null) reminder.setRecurring(Reminder.Recurring.valueOf(dto.recurring));
        Reminder saved = reminderRepository.save(reminder);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/myReminders")
    public ResponseEntity<Reminder> updateReminder(@RequestBody ReminderDto dto) {
        if (dto.id == 0) return ResponseEntity.badRequest().build();
        Reminder reminder = reminderRepository.findById(dto.id).orElse(null);
        if (reminder == null) return ResponseEntity.notFound().build();
        if (dto.studentId != 0) {
            Student student = studentRepository.findById(dto.studentId);
            if (student == null) return ResponseEntity.badRequest().build();
            reminder.setStudent(student);
        }
        if (dto.title != null) reminder.setTitle(dto.title);
        if (dto.description != null) reminder.setDescription(dto.description);
        if (dto.reminderDate != null) reminder.setReminderDate(LocalDate.parse(dto.reminderDate));
        if (dto.reminderTime != null) reminder.setReminderTime(LocalTime.parse(dto.reminderTime));
        if (dto.recurring != null) reminder.setRecurring(Reminder.Recurring.valueOf(dto.recurring));
        Reminder updated = reminderRepository.save(reminder);
        return ResponseEntity.ok(updated);
    }

	// Get reminder by ID
	//	@GetMapping("/{id}")
	//	public ResponseEntity<Reminder> getReminderById(@PathVariable Integer id) {
	//		Optional<Reminder> reminder = reminderRepository.findById(id);
	//		return reminder.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
	//	}

	//	// Create new reminder
	//	@PostMapping
	//	public Reminder createReminder(@RequestBody Reminder reminder) {
	//		return reminderRepository.save(reminder);
	//	}

	//	// Update existing reminder
	//	@PutMapping("/{id}")
	//	public ResponseEntity<Reminder> updateReminder(@PathVariable Integer id, @RequestBody Reminder updatedReminder) {
	//		return reminderRepository.findById(id).map(reminder -> {
	//			reminder.setTitle(updatedReminder.getTitle());
	//			reminder.setDescription(updatedReminder.getDescription());
	//			reminder.setReminderDate(updatedReminder.getReminderDate());
	//			reminder.setReminderTime(updatedReminder.getReminderTime());
	//			reminder.setRecurring(updatedReminder.getRecurring());
	//			reminder.setStudent(updatedReminder.getStudent());
	//			return ResponseEntity.ok(reminderRepository.save(reminder));
	//		}).orElseGet(() -> ResponseEntity.notFound().build());
	//	}
	//
	//	// Delete reminder
	//	@DeleteMapping("/{id}")
	//	public ResponseEntity<Void> deleteReminder(@PathVariable Integer id) {
	//		if (reminderRepository.existsById(id)) {
	//			reminderRepository.deleteById(id);
	//			return ResponseEntity.noContent().build();
	//		}
	//		return ResponseEntity.notFound().build();
	//	}

    public static class ReminderDto {
        public long id;
        public long studentId;
        public String title;
        public String description;
        public String reminderDate;
        public String reminderTime;
        public String recurring;
    }
}
