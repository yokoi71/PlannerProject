import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { Course } from '../../model/course.model';
import { StudentDataStorage } from '../../services/student-data-storage/student-data-storage.service';
import { CourseWeeklySchedule } from '../../model/courseweeklyschedule.model';

@Component({
  selector: 'app-add-class',
  templateUrl: './add-class.component.html',
  styleUrls: ['./add-class.component.css'],
})
export class AddClassComponent {
  @Input() semesterId: number = 0;
  @Output() classAdded = new EventEmitter<Course>();
  @Output() cancelled = new EventEmitter<void>();

  course: Course = new Course();
  isSubmitting: boolean = false;
  errorMessage: string = '';

  daysOfWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  selectedDays: string[] = [];
  startTime: string = '';
  endTime: string = '';

  dayTimes: { [day: string]: { start: string; end: string } } = {};

  timeOptions: string[] = [];

  constructor(
    private dashboardService: DashboardService,
    private studentDataStorageService: StudentDataStorage
  ) {
    // Generate time options every 10 minutes from 07:00 to 22:50
    const startHour = 7;
    const endHour = 22;
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let min = 0; min < 60; min += 10) {
        const hourStr = hour.toString().padStart(2, '0');
        const minStr = min.toString().padStart(2, '0');
        this.timeOptions.push(`${hourStr}:${minStr}`);
      }
    }
  }

  onDayToggle(day: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.dayTimes[day] = { start: '', end: '' };
    } else {
      delete this.dayTimes[day];
    }
  }

  onSubmit() {
    // Check for schedule overlap before proceeding
    if (this.hasScheduleOverlap(this.dayTimes)) {
      this.errorMessage =
        'This class overlaps with an existing class schedule.';
      return;
    }
    if (!this.course.courseName.trim()) {
      this.errorMessage = 'Course name is required';
      return;
    }
    const selectedDays = Object.keys(this.dayTimes);
    if (selectedDays.length === 0) {
      this.errorMessage = 'Please select at least one day.';
      return;
    }
    for (const day of selectedDays) {
      const times = this.dayTimes[day];
      if (!times.start || !times.end) {
        this.errorMessage = `Please enter start and end times for ${day}.`;
        return;
      }
    }
    this.isSubmitting = true;
    this.errorMessage = '';

    // Create the request payload that matches the backend CourseRequest
    const courseRequest = {
      semesterId: this.semesterId,
      courseName: this.course.courseName,
      professorName: this.course.professorName,
      room: this.course.room,
    };

    // First, create the course
    this.dashboardService.addCourse(courseRequest).subscribe({
      next: (response) => {
        const newCourse = response.body;
        if (newCourse) {
          // Now create weekly schedules for each selected day
          this.createWeeklySchedules(newCourse.id);
        } else {
          this.isSubmitting = false;
          this.errorMessage = 'Failed to create course. Please try again.';
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error adding course:', error);
        this.errorMessage = 'Failed to add course. Please try again.';
      },
    });
  }

  private createWeeklySchedules(courseId: number) {
    const selectedDays = Object.keys(this.dayTimes);
    let hasError = false;

    const scheduleRequests = selectedDays.map((day) => ({
      courseId: courseId,
      dayOfWeek: day,
      startTime: this.dayTimes[day].start,
      endTime: this.dayTimes[day].end,
    }));

    const processNext = (index: number) => {
      if (index >= scheduleRequests.length) {
        // All schedules created successfully
        this.isSubmitting = false;
        this.classAdded.emit(new Course()); // You might want to get the actual course from the response
        this.resetForm();
        return;
      }

      const scheduleRequest = scheduleRequests[index];
      this.dashboardService.addCourseWeeklySchedule(scheduleRequest).subscribe({
        next: (response) => {
          // Wait for the next event loop tick to ensure the cookie is updated
          setTimeout(() => processNext(index + 1), 0);
        },
        error: (error) => {
          hasError = true;
          this.isSubmitting = false;
          console.error(
            `Error adding schedule for ${scheduleRequest.dayOfWeek}:`,
            error
          );
          this.errorMessage = `Failed to create schedule for ${scheduleRequest.dayOfWeek}. Please try again.`;
        },
      });
    };

    if (scheduleRequests.length === 0) {
      this.isSubmitting = false;
      this.classAdded.emit(new Course());
      this.resetForm();
      return;
    }

    processNext(0); // Start the first request
  }

  // private createWeeklySchedules(courseId: number) {
  //   const selectedDays = Object.keys(this.dayTimes);
  //   let completedSchedules = 0;
  //   let hasError = false;

  //   if (selectedDays.length === 0) {
  //     // No schedules to create, just emit the course
  //     this.isSubmitting = false;
  //     this.classAdded.emit(new Course()); // You might want to get the actual course from the response
  //     this.resetForm();
  //     return;
  //   }

  //   selectedDays.forEach((day) => {
  //     const times = this.dayTimes[day];
  //     const scheduleRequest = {
  //       courseId: courseId,
  //       dayOfWeek: day,
  //       startTime: times.start,
  //       endTime: times.end,
  //     };

  //     this.dashboardService.addCourseWeeklySchedule(scheduleRequest).subscribe({
  //       next: (response) => {
  //         completedSchedules++;
  //         if (completedSchedules === selectedDays.length && !hasError) {
  //           // All schedules created successfully
  //           this.isSubmitting = false;
  //           this.classAdded.emit(new Course()); // You might want to get the actual course from the response
  //           this.resetForm();
  //         }
  //       },
  //       error: (error) => {
  //         hasError = true;
  //         this.isSubmitting = false;
  //         console.error(`Error adding schedule for ${day}:`, error);
  //         this.errorMessage = `Failed to create schedule for ${day}. Please try again.`;
  //       },
  //     });
  //   });
  // }

  onCancel() {
    this.cancelled.emit();
    this.resetForm();
  }

  private resetForm() {
    this.course = new Course();
    this.errorMessage = '';
  }

  /**
   * Checks if the new class schedule overlaps with any existing class schedule.
   * @param newDayTimes An object like { Monday: {start: '09:00', end: '10:00'}, ... }
   * @returns true if there is an overlap, false otherwise
   */
  hasScheduleOverlap(newDayTimes: {
    [day: string]: { start: string; end: string };
  }): boolean {
    // Get all existing schedules from the student data storage
    const existingSchedules: CourseWeeklySchedule[] =
      this.studentDataStorageService.getCourseWeeklyScheduleInfo() || [];
    for (const day of Object.keys(newDayTimes)) {
      const newStart = newDayTimes[day].start;
      const newEnd = newDayTimes[day].end;
      // Check against all existing schedules for the same day
      for (const sched of existingSchedules) {
        if (sched.dayOfWeek === day) {
          // If the intervals overlap: (startA < endB && endA > startB)
          if (newStart < sched.endTime && newEnd > sched.startTime) {
            return true;
          }
        }
      }
    }
    return false;
  }

  getEndTimeOptions(day: string): string[] {
    const start = this.dayTimes[day]?.start;
    if (!start) {
      return this.timeOptions;
    }
    // Only show times strictly after the selected start time
    return this.timeOptions.filter((t) => t > start);
  }

  getStartTimeOptions(day: string): string[] {
    const end = this.dayTimes[day]?.end;
    if (!end) {
      return this.timeOptions;
    }
    // Only show times strictly before the selected end time
    return this.timeOptions.filter((t) => t < end);
  }
}
