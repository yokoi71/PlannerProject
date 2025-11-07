import { Component, OnInit, inject } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { StudentDataStorage } from '../../services/student-data-storage/student-data-storage.service';
import { Course } from '../../model/course.model';
import { CourseWeeklySchedule } from '../../model/courseweeklyschedule.model';
import { Semester } from 'src/app/model/semester.model';
import { Student } from 'src/app/model/student.model';
import { User } from 'src/app/model/user.model';
import { Reminder } from '../../model/reminder.model';
import { Event as PlannerEvent } from '../../model/event.model';
import { Holiday } from '../../model/holiday.model';
import { Homework } from '../../model/homework.model';
import { Exam } from '../../model/exam.model';

@Component({
  selector: 'app-weekly-schedule',
  templateUrl: './weekly-schedule.component.html',
  styleUrls: ['./weekly-schedule.component.css'],
})
export class WeeklyScheduleComponent implements OnInit {
  selectedSemester: Semester | null = null;
  student: Student | null = null;
  schedules: any[] = [];
  reminders: any[] = [];

  // Week selection properties
  currentWeekStart: Date = new Date();
  currentWeekEnd: Date = new Date();

  // Properties for courses and weekly schedules
  courses: Course[] = [];
  weeklySchedules: CourseWeeklySchedule[] = [];

  // Properties for reminders, events, and holidays
  remindersData: Reminder[] = [];
  eventsData: PlannerEvent[] = [];
  holidaysData: Holiday[] = [];
  homeworkData: Homework[] = [];
  examsData: Exam[] = [];

  // Inject services
  private dashboardService = inject(DashboardService);
  private studentDataStorageService = inject(StudentDataStorage);

  ngOnInit(): void {
    this.calculateCurrentWeek();
    this.loadStudentAndSemesterData();
    // Load other data (reminders, events, holidays, homework, exams) after student/semester data is loaded
    this.loadReminders();
    this.loadEvents();
    this.loadHolidays();
    this.loadHomework();
    this.loadExams();

    // Process reminders after a short delay to ensure all data is loaded
    setTimeout(() => {
      this.processReminders();
    }, 1000);
  }

  private loadStudentAndSemesterData() {
    // Try to get student data from storage first
    this.student = this.studentDataStorageService.getStudentInfo();

    // Try to get semester data from storage first
    const semesters = this.studentDataStorageService.getSemesterInfo();

    if (
      !this.student ||
      !this.student.id ||
      !semesters ||
      semesters.length === 0
    ) {
      // If data is not available in storage, fetch from backend
      this.loadStudentAndSemesterFromBackend();
    } else {
      // Set the selected semester based on current week
      this.setCurrentSemester(semesters);
      // Load courses and schedules for the selected semester (if any)
      if (this.selectedSemester) {
        this.loadCoursesAndSchedulesForSelectedSemester();
      } else {
        console.log(
          'No semester selected for current week - no courses to load'
        );
      }
    }
  }

  private loadStudentAndSemesterFromBackend() {
    // Get user ID from sessionStorage
    let user: User | null = null;
    if (sessionStorage.getItem('userdetails')) {
      user = JSON.parse(sessionStorage.getItem('userdetails') || '');
    }

    if (!user || !user.id) {
      console.error('No user information available');
      return;
    }

    // Load student data
    this.dashboardService.getStudentInfo(user.id).subscribe({
      next: (response: any) => {
        if (response.body) {
          this.student = response.body;
          this.studentDataStorageService.setStudentInfo(this.student!);
        }
      },
      error: (err: any) => {
        console.error('Failed to load student details:', err);
      },
    });

    // Load semester data
    this.dashboardService.getSemester(user.id).subscribe({
      next: (response: any) => {
        if (response.body) {
          const semestersFromApi = response.body;

          // Transform to the expected format (same as dashboard component)
          const formattedSemesters = semestersFromApi.map((semester: any) => {
            return {
              id: semester.id,
              studentId: semester.student?.id ?? 0,
              year: semester.year,
              term: semester.term,
              startDate: semester.startDate,
              endDate: semester.endDate,
            };
          });

          this.studentDataStorageService.setSemesterInfo(formattedSemesters);
          this.setCurrentSemester(formattedSemesters);
          // Load courses and schedules for the selected semester (if any)
          if (this.selectedSemester) {
            this.loadCoursesAndSchedulesForSelectedSemester();
          } else {
            console.log(
              'No semester selected for current week - no courses to load'
            );
          }
        }
      },
      error: (err: any) => {
        console.error('Failed to load semesters:', err);
      },
    });
  }

  private setCurrentSemester(semesters: Semester[]) {
    // Find the semester that overlaps with the current week
    const currentWeekStart = this.currentWeekStart;
    const currentWeekEnd = this.currentWeekEnd;

    this.selectedSemester =
      semesters.find((semester) => {
        const semesterStart = new Date(semester.startDate);
        const semesterEnd = new Date(semester.endDate);

        // Check if semester overlaps with current week
        // Semester starts in the middle of the week, ends in the middle of the week,
        // completely contains the week, or is completely contained by the week
        return (
          semesterStart <= currentWeekEnd && semesterEnd >= currentWeekStart
        );
      }) ?? null; // Set to null if no semester overlaps with the current week

    console.log('Selected semester for current week:', this.selectedSemester);
  }

  private loadCoursesAndSchedulesForSelectedSemester() {
    console.log('Loading courses for semester ID:', this.selectedSemester?.id);

    // First, ensure reminders are processed
    this.processReminders();

    this.dashboardService.getCourses(this.selectedSemester!.id).subscribe({
      next: (response) => {
        if (response.body) {
          this.courses = response.body;
          // Store courses in student data storage
          this.studentDataStorageService.setCoursesInfo(this.courses);
          // Now load weekly schedules
          this.loadWeeklySchedulesForSelectedSemester();
        }
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
      },
    });
  }

  private loadWeeklySchedulesForSelectedSemester() {
    if (!this.courses || this.courses.length === 0) {
      console.error('No courses available to load weekly schedules');
      return;
    }

    console.log(
      'Loading weekly schedules from backend for courses:',
      this.courses.map((c) => c.id)
    );

    // Always fetch weekly schedules from backend for each course
    const schedulePromises = this.courses.map((course) =>
      this.dashboardService.getCourseWeeklySchedule(course.id).toPromise()
    );

    Promise.all(schedulePromises)
      .then((responses) => {
        const allSchedules: CourseWeeklySchedule[] = [];

        responses.forEach((response: any) => {
          if (response && response.body) {
            allSchedules.push(...response.body);
          }
        });

        this.weeklySchedules = allSchedules;
        console.log(
          'Loaded weekly schedules from backend for semester',
          this.selectedSemester?.id,
          ':',
          this.weeklySchedules
        );

        // Store weekly schedules in student data storage
        this.studentDataStorageService.setCourseWeeklyScheduleInfo(
          this.weeklySchedules
        );

        // Process the weekly schedules
        this.processWeeklySchedules();
      })
      .catch((error) => {
        console.error(
          'Failed to load weekly schedules for semester',
          this.selectedSemester?.id,
          ':',
          error
        );
      });
  }

  private updateSemesterForCurrentWeek() {
    const semesters = this.studentDataStorageService.getSemesterInfo();
    if (!semesters || semesters.length === 0) {
      console.error('No semester information available');
      return;
    }

    // Find the semester that overlaps with the current week
    const currentWeekStart = this.currentWeekStart;
    const currentWeekEnd = this.currentWeekEnd;
    const newSelectedSemester =
      semesters.find((semester) => {
        const semesterStart = new Date(semester.startDate);
        const semesterEnd = new Date(semester.endDate);

        // Check if semester overlaps with current week
        // Semester starts in the middle of the week, ends in the middle of the week,
        // completely contains the week, or is completely contained by the week
        return (
          semesterStart <= currentWeekEnd && semesterEnd >= currentWeekStart
        );
      }) ?? null; // Set to null if no semester overlaps with the current week

    // Check if semester has changed
    const semesterChanged =
      !this.selectedSemester ||
      (this.selectedSemester &&
        newSelectedSemester &&
        this.selectedSemester.id !== newSelectedSemester.id) ||
      (!this.selectedSemester && newSelectedSemester) ||
      (this.selectedSemester && !newSelectedSemester);

    if (semesterChanged) {
      console.log(
        'Semester changed from',
        this.selectedSemester?.id,
        'to',
        newSelectedSemester?.id
      );
      this.selectedSemester = newSelectedSemester;

      // Only reload courses and schedules if we have a valid semester
      if (this.selectedSemester) {
        console.log(
          'Fetching courses and schedules for new semester:',
          this.selectedSemester.id
        );
        this.loadCoursesAndSchedulesForSelectedSemester();
      } else {
        // Clear courses and schedules when no semester is selected
        this.courses = [];
        this.weeklySchedules = [];
        this.reminders = []; // Clear the displayed reminders
        this.studentDataStorageService.setCoursesInfo([]);
        this.studentDataStorageService.setCourseWeeklyScheduleInfo([]);
        console.log(
          'No semester selected for current week - cleared courses, schedules, and reminders'
        );

        // Still process weekly schedules to show empty structure with reminders and events
        this.processWeeklySchedules();
        this.processReminders();
      }
    } else {
      // Semester hasn't changed, but week has changed
      // We need to reprocess the schedules for the new week
      console.log('Week changed within same semester - reprocessing schedules');
      if (
        this.selectedSemester &&
        this.courses.length > 0 &&
        this.weeklySchedules.length > 0
      ) {
        // Reprocess schedules for the new week
        this.processWeeklySchedules();
        // Also reprocess reminders for the new week
        this.processReminders();
      }
    }
  }

  private calculateCurrentWeek() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate start of week (Monday)
    const startOfWeek = new Date(today);
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday, go back 6 days to Monday
    startOfWeek.setDate(today.getDate() - daysToSubtract);
    startOfWeek.setHours(0, 0, 0, 0);

    // Calculate end of week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    this.currentWeekStart = startOfWeek;
    this.currentWeekEnd = endOfWeek;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  getCurrentWeekDisplay(): string {
    const startDate = this.formatDate(this.currentWeekStart);
    const endDate = this.formatDate(this.currentWeekEnd);
    return `${startDate} - ${endDate}`;
  }

  goToPreviousWeek() {
    // Move back 7 days from current week start
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(this.currentWeekStart.getDate() - 7);

    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + 6);
    newEnd.setHours(23, 59, 59, 999);

    this.currentWeekStart = newStart;
    this.currentWeekEnd = newEnd;

    // Update semester selection based on new week and reload courses if needed
    this.updateSemesterForCurrentWeek();
  }

  goToNextWeek() {
    // Move forward 7 days from current week start
    const newStart = new Date(this.currentWeekStart);
    newStart.setDate(this.currentWeekStart.getDate() + 7);

    const newEnd = new Date(newStart);
    newEnd.setDate(newStart.getDate() + 6);
    newEnd.setHours(23, 59, 59, 999);

    this.currentWeekStart = newStart;
    this.currentWeekEnd = newEnd;

    // Update semester selection based on new week and reload courses if needed
    this.updateSemesterForCurrentWeek();
  }

  private loadAllData() {
    // Load courses and schedules first
    this.loadCoursesAndSchedules();

    // Load reminders, events, and holidays
    this.loadReminders();
    this.loadEvents();
    this.loadHolidays();
  }

  private loadCoursesAndSchedules() {
    // Get semesters first to get semester ID
    const semesters = this.studentDataStorageService.getSemesterInfo();
    if (!semesters || semesters.length === 0) {
      console.error('No semester information available');
      return;
    }

    const currentYear = new Date().getFullYear();
    const thisMonth = new Date().getMonth() + 1;
    let currentTerm = '';
    if (thisMonth >= 9 && thisMonth <= 12) {
      currentTerm = 'fall';
    } else if (thisMonth >= 1 && thisMonth <= 5) {
      currentTerm = 'spring';
    } else {
      currentTerm = 'summer';
    }
    this.selectedSemester =
      semesters.find(
        (s) => s.year === currentYear && s.term.toLowerCase() === currentTerm
      ) ?? semesters[0];

    // First, try to get courses from student data storage
    this.courses = this.studentDataStorageService.getCoursesInfo();

    if (!this.courses || this.courses.length === 0) {
      // If no courses in storage, get from backend
      this.loadCoursesFromBackend();
    } else {
      // If courses exist, try to get weekly schedules
      this.loadWeeklySchedules();
    }
  }

  private loadCoursesFromBackend() {
    if (!this.selectedSemester || !this.selectedSemester.id) {
      console.error('No valid semester selected for loading courses');
      return;
    }

    this.dashboardService.getCourses(this.selectedSemester.id).subscribe({
      next: (response) => {
        if (response.body) {
          this.courses = response.body;
          // Store courses in student data storage
          this.studentDataStorageService.setCoursesInfo(this.courses);
          // Now load weekly schedules
          this.loadWeeklySchedules();
        }
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
      },
    });
  }

  private loadWeeklySchedules() {
    // Try to get weekly schedules from student data storage
    this.weeklySchedules =
      this.studentDataStorageService.getCourseWeeklyScheduleInfo();

    if (!this.weeklySchedules || this.weeklySchedules.length === 0) {
      // If no weekly schedules in storage, get from backend for each course
      this.loadWeeklySchedulesFromBackend();
    } else {
      // If weekly schedules exist, process them
      this.processWeeklySchedules();
    }
  }

  private loadWeeklySchedulesFromBackend() {
    if (!this.courses || this.courses.length === 0) {
      console.error('No courses available to load weekly schedules');
      return;
    }

    // Load weekly schedules for each course
    const schedulePromises = this.courses.map((course) =>
      this.dashboardService.getCourseWeeklySchedule(course.id).toPromise()
    );

    Promise.all(schedulePromises)
      .then((responses) => {
        const allSchedules: CourseWeeklySchedule[] = [];

        responses.forEach((response) => {
          if (response && response.body) {
            allSchedules.push(...response.body);
          }
        });

        this.weeklySchedules = allSchedules;
        // Store weekly schedules in student data storage
        this.studentDataStorageService.setCourseWeeklyScheduleInfo(
          this.weeklySchedules
        );
        // Process the schedules
        this.processWeeklySchedules();
      })
      .catch((err) => {
        console.error('Failed to load weekly schedules:', err);
      });
  }

  private loadReminders() {
    // Try to get reminders from student data storage
    this.remindersData = this.studentDataStorageService.getRemindersInfo();

    if (!this.remindersData || this.remindersData.length === 0) {
      // If no reminders in storage, get from backend
      this.loadRemindersFromBackend();
    }
    // Don't call processReminders here - let the main processReminders method handle it
  }

  private loadRemindersFromBackend() {
    const student = this.studentDataStorageService.getStudentInfo();
    if (!student || !student.id) {
      console.error('No student information available for loading reminders');
      return;
    }

    this.dashboardService.getReminders(student.id).subscribe({
      next: (response) => {
        if (response.body) {
          this.remindersData = response.body;
          // Store reminders in student data storage
          this.studentDataStorageService.setRemindersInfo(this.remindersData);
          // Don't call processReminders here - let the main processReminders method handle it
        }
      },
      error: (err) => {
        console.error('Failed to load reminders:', err);
      },
    });
  }

  private loadEvents() {
    // Try to get events from student data storage
    this.eventsData = this.studentDataStorageService.getEventsInfo();

    if (!this.eventsData || this.eventsData.length === 0) {
      // If no events in storage, get from backend
      this.loadEventsFromBackend();
    }
    // Don't call processEvents here - let the main processReminders method handle it
  }

  private loadEventsFromBackend() {
    const student = this.studentDataStorageService.getStudentInfo();
    if (!student || !student.id) {
      console.error('No student information available for loading events');
      return;
    }

    this.dashboardService.getEvents(student.id).subscribe({
      next: (response) => {
        if (response.body) {
          this.eventsData = response.body;
          // Store events in student data storage
          this.studentDataStorageService.setEventsInfo(this.eventsData);
          // Don't call processEvents here - let the main processReminders method handle it
        }
      },
      error: (err) => {
        console.error('Failed to load events:', err);
      },
    });
  }

  private loadHolidays() {
    // Try to get holidays from student data storage
    this.holidaysData = this.studentDataStorageService.getHoidaysInfo();

    if (!this.holidaysData || this.holidaysData.length === 0) {
      // If no holidays in storage, get from backend
      this.loadHolidaysFromBackend();
    } else {
      // If holidays exist, process them
      this.processHolidays();
    }
  }

  private loadHolidaysFromBackend() {
    const student = this.studentDataStorageService.getStudentInfo();
    if (!student || !student.id) {
      console.error('No student information available for loading holidays');
      return;
    }

    this.dashboardService.getHolidays(student.id).subscribe({
      next: (response) => {
        if (response.body) {
          this.holidaysData = response.body;
          // Store holidays in student data storage
          this.studentDataStorageService.setHoidaysInfo(this.holidaysData);
          // Process the holidays
          this.processHolidays();
        }
      },
      error: (err) => {
        console.error('Failed to load holidays:', err);
      },
    });
  }

  private loadHomework() {
    // Try to get homework from student data storage
    this.homeworkData = this.studentDataStorageService.getHomeworkInfo();

    if (!this.homeworkData || this.homeworkData.length === 0) {
      // If no homework in storage, get from backend
      this.loadHomeworkFromBackend();
    }
    // Don't call processHomework here - let the main processReminders method handle it
  }

  private loadHomeworkFromBackend() {
    const student = this.studentDataStorageService.getStudentInfo();
    if (!student || !student.id) {
      console.error('No student information available for loading homework');
      return;
    }

    this.dashboardService.getHomework(student.id).subscribe({
      next: (response) => {
        if (response.body) {
          this.homeworkData = response.body;
          // Store homework in student data storage
          this.studentDataStorageService.setHomeworkInfo(this.homeworkData);
          // Don't call processHomework here - let the main processReminders method handle it
        }
      },
      error: (err) => {
        console.error('Failed to load homework:', err);
      },
    });
  }

  private loadExams() {
    // Try to get exams from student data storage
    this.examsData = this.studentDataStorageService.getExamsInfo();

    if (!this.examsData || this.examsData.length === 0) {
      // If no exams in storage, get from backend
      this.loadExamsFromBackend();
    }
    // Don't call processExams here - let the main processReminders method handle it
  }

  private loadExamsFromBackend() {
    const student = this.studentDataStorageService.getStudentInfo();
    if (!student || !student.id) {
      console.error('No student information available for loading exams');
      return;
    }

    this.dashboardService.getExams(student.id).subscribe({
      next: (response) => {
        if (response.body) {
          this.examsData = response.body;
          // Store exams in student data storage
          this.studentDataStorageService.setExamsInfo(this.examsData);
          // Don't call processExams here - let the main processReminders method handle it
        }
      },
      error: (err) => {
        console.error('Failed to load exams:', err);
      },
    });
  }

  private processReminders() {
    console.log('=== PROCESSING REMINDERS ===');
    console.log('Reminders loaded:', this.remindersData);
    console.log('Current week start:', this.currentWeekStart);
    console.log('Current week end:', this.currentWeekEnd);

    if (!this.remindersData || this.remindersData.length === 0) {
      console.log('No reminders data available');
      return;
    }

    // Filter reminders for the current week
    const weekReminders = this.remindersData.filter((reminder) => {
      if (!reminder.reminderDate) {
        console.log('Reminder has no date:', reminder);
        return false;
      }

      const reminderDate = new Date(reminder.reminderDate);
      const weekStart = new Date(this.currentWeekStart);
      const weekEnd = new Date(this.currentWeekEnd);

      console.log(
        `Checking reminder: ${reminder.title} on ${reminder.reminderDate}`
      );
      console.log(`Reminder date: ${reminderDate.toDateString()}`);
      console.log(
        `Week start: ${weekStart.toDateString()}, Week end: ${weekEnd.toDateString()}`
      );

      // Check if reminder is within the current week
      const isInWeek = reminderDate >= weekStart && reminderDate <= weekEnd;
      console.log(`Is in week: ${isInWeek}`);

      return isInWeek;
    });

    console.log(
      `Found ${weekReminders.length} reminders for the current week:`,
      weekReminders
    );

    // Process reminders for display
    this.reminders = weekReminders.map((reminder) => {
      const reminderDate = new Date(reminder.reminderDate);
      const dayName = reminderDate.toLocaleDateString('en-US', {
        weekday: 'long',
      });
      const dateString = reminderDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const timeString = reminder.reminderTime || 'All day';
      const daysLeft = this.calculateDaysLeft(reminderDate);

      console.log(`Processed reminder:`, {
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        date: dateString,
        day: dayName,
        time: timeString,
        recurring: reminder.recurring,
        daysLeft: daysLeft,
      });

      return {
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        date: dateString,
        day: dayName,
        time: timeString,
        recurring: reminder.recurring,
        type: 'Reminder',
        daysLeft: daysLeft,
      };
    });

    // Add homework assignments for the current week
    if (this.homeworkData && this.homeworkData.length > 0) {
      const weekHomework = this.homeworkData.filter((homework) => {
        if (!homework.dueDate) return false;

        const homeworkDate = new Date(homework.dueDate);
        const weekStart = new Date(this.currentWeekStart);
        const weekEnd = new Date(this.currentWeekEnd);

        return homeworkDate >= weekStart && homeworkDate <= weekEnd;
      });

      weekHomework.forEach((homework) => {
        const homeworkDate = new Date(homework.dueDate);
        const dayName = homeworkDate.toLocaleDateString('en-US', {
          weekday: 'long',
        });
        const dateString = homeworkDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        const daysLeft = this.calculateDaysLeft(homeworkDate);

        this.reminders.push({
          id: homework.id,
          title: homework.title,
          description: homework.description,
          date: dateString,
          day: dayName,
          time: 'Due Today',
          status: homework.status,
          type: 'Homework',
          courseId: homework.courseId,
          daysLeft: daysLeft,
        });
      });
    }

    // Add exams for the current week
    if (this.examsData && this.examsData.length > 0) {
      const weekExams = this.examsData.filter((exam) => {
        if (!exam.examDate) return false;

        const examDate = new Date(exam.examDate);
        const weekStart = new Date(this.currentWeekStart);
        const weekEnd = new Date(this.currentWeekEnd);

        return examDate >= weekStart && examDate <= weekEnd;
      });

      weekExams.forEach((exam) => {
        const examDate = new Date(exam.examDate);
        const dayName = examDate.toLocaleDateString('en-US', {
          weekday: 'long',
        });
        const dateString = examDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        const timeString = exam.startTime
          ? `${exam.startTime} - ${exam.endTime || ''}`
          : 'All day';
        const daysLeft = this.calculateDaysLeft(examDate);

        this.reminders.push({
          id: exam.id,
          title: `${exam.examType} Exam`,
          description: `Location: ${exam.location || 'TBD'}`,
          date: dateString,
          day: dayName,
          time: timeString,
          type: 'Exam',
          examType: exam.examType,
          courseId: exam.courseId,
          daysLeft: daysLeft,
        });
      });
    }

    // Add events for the current week
    if (this.eventsData && this.eventsData.length > 0) {
      const weekEvents = this.eventsData.filter((event) => {
        if (!event.startDate) return false;

        // Parse event dates manually to avoid timezone issues
        const eventStartParts = event.startDate.split('-');
        const eventEndParts = event.endDate
          ? event.endDate.split('-')
          : eventStartParts;

        const eventStartYear = parseInt(eventStartParts[0]);
        const eventStartMonth = parseInt(eventStartParts[1]) - 1; // Month is 0-indexed
        const eventStartDay = parseInt(eventStartParts[2]);

        const eventEndYear = parseInt(eventEndParts[0]);
        const eventEndMonth = parseInt(eventEndParts[1]) - 1; // Month is 0-indexed
        const eventEndDay = parseInt(eventEndParts[2]);

        const eventStartValue =
          eventStartYear * 10000 + eventStartMonth * 100 + eventStartDay;
        const eventEndValue =
          eventEndYear * 10000 + eventEndMonth * 100 + eventEndDay;
        const weekStartValue =
          this.currentWeekStart.getFullYear() * 10000 +
          this.currentWeekStart.getMonth() * 100 +
          this.currentWeekStart.getDate();
        const weekEndValue =
          this.currentWeekEnd.getFullYear() * 10000 +
          this.currentWeekEnd.getMonth() * 100 +
          this.currentWeekEnd.getDate();

        // Check if event overlaps with the current week
        const overlaps =
          eventStartValue <= weekEndValue && eventEndValue >= weekStartValue;
        console.log(
          `Checking event ${event.title} for current week: ${overlaps} (event: ${eventStartValue}-${eventEndValue}, week: ${weekStartValue}-${weekEndValue})`
        );
        return overlaps;
      });

      weekEvents.forEach((event) => {
        // Parse event start date manually for display
        const eventStartParts = event.startDate.split('-');
        const eventStartYear = parseInt(eventStartParts[0]);
        const eventStartMonth = parseInt(eventStartParts[1]) - 1; // Month is 0-indexed
        const eventStartDay = parseInt(eventStartParts[2]);

        // Create a proper Date object for formatting
        const eventStartDate = new Date(
          eventStartYear,
          eventStartMonth,
          eventStartDay
        );
        const dayName = eventStartDate.toLocaleDateString('en-US', {
          weekday: 'long',
        });
        const dateString = eventStartDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        const timeString = event.startTime
          ? `${event.startTime} - ${event.endTime || ''}`
          : 'All day';
        const daysLeft = this.calculateDaysLeft(eventStartDate);

        this.reminders.push({
          id: event.id,
          title: event.title,
          description: event.notes || '',
          date: dateString,
          day: dayName,
          time: timeString,
          type: 'Event',
          location: event.location || '',
          eventId: event.id,
          daysLeft: daysLeft,
        });
      });
    }

    // Sort reminders by date and time
    this.reminders.sort((a, b) => {
      const dateA = new Date(a.date + ', ' + new Date().getFullYear());
      const dateB = new Date(b.date + ', ' + new Date().getFullYear());

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }

      // If same date, sort by time
      const timeA =
        a.time === 'All day' || a.time === 'Due Today'
          ? '00:00'
          : a.time.split(' - ')[0];
      const timeB =
        b.time === 'All day' || b.time === 'Due Today'
          ? '00:00'
          : b.time.split(' - ')[0];

      return timeA.localeCompare(timeB);
    });

    console.log(`Final processed reminders for current week:`, this.reminders);
    console.log('=== END PROCESSING REMINDERS ===');
  }

  /**
   * Get color class based on reminder priority
   */
  private getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-green-500 bg-green-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  }

  private processEvents() {
    console.log('=== PROCESSING EVENTS ===');
    console.log('Events loaded:', this.eventsData);
    console.log('Current week start:', this.currentWeekStart);
    console.log('Current week end:', this.currentWeekEnd);

    if (!this.eventsData || this.eventsData.length === 0) {
      console.log('No events data available');
      return;
    }

    // Filter events for the current week
    const weekEvents = this.eventsData.filter((event) => {
      if (!event.startDate) {
        console.log('Event has no start date:', event);
        return false;
      }

      const eventStartDate = new Date(event.startDate);
      const eventEndDate = event.endDate
        ? new Date(event.endDate)
        : eventStartDate;
      const weekStart = new Date(this.currentWeekStart);
      const weekEnd = new Date(this.currentWeekEnd);

      console.log(
        `Checking event: ${event.title} from ${event.startDate} to ${event.endDate}`
      );
      console.log(
        `Event start: ${eventStartDate.toDateString()}, Event end: ${eventEndDate.toDateString()}`
      );
      console.log(
        `Week start: ${weekStart.toDateString()}, Week end: ${weekEnd.toDateString()}`
      );

      // Check if event overlaps with the current week
      const overlaps = eventStartDate <= weekEnd && eventEndDate >= weekStart;
      console.log(`Overlaps with week: ${overlaps}`);

      return overlaps;
    });

    console.log(
      `Found ${weekEvents.length} events for the current week:`,
      weekEvents
    );
    console.log('=== END PROCESSING EVENTS ===');
  }

  private processHomework() {
    console.log('=== PROCESSING HOMEWORK ===');
    console.log('Homework loaded:', this.homeworkData);
    console.log('Current week start:', this.currentWeekStart);
    console.log('Current week end:', this.currentWeekEnd);

    if (!this.homeworkData || this.homeworkData.length === 0) {
      console.log('No homework data available');
      return;
    }

    // Filter homework for the current week
    const weekHomework = this.homeworkData.filter((homework) => {
      if (!homework.dueDate) {
        console.log('Homework has no due date:', homework);
        return false;
      }

      const homeworkDate = new Date(homework.dueDate);
      const weekStart = new Date(this.currentWeekStart);
      const weekEnd = new Date(this.currentWeekEnd);

      console.log(
        `Checking homework: ${homework.title} due ${homework.dueDate}`
      );
      console.log(`Homework date: ${homeworkDate.toDateString()}`);
      console.log(
        `Week start: ${weekStart.toDateString()}, Week end: ${weekEnd.toDateString()}`
      );

      // Check if homework is due within the current week
      const isInWeek = homeworkDate >= weekStart && homeworkDate <= weekEnd;
      console.log(`Is in week: ${isInWeek}`);

      return isInWeek;
    });

    console.log(
      `Found ${weekHomework.length} homework assignments for the current week:`,
      weekHomework
    );
    console.log('=== END PROCESSING HOMEWORK ===');
  }

  private processExams() {
    console.log('=== PROCESSING EXAMS ===');
    console.log('Exams loaded:', this.examsData);
    console.log('Current week start:', this.currentWeekStart);
    console.log('Current week end:', this.currentWeekEnd);

    if (!this.examsData || this.examsData.length === 0) {
      console.log('No exams data available');
      return;
    }

    // Filter exams for the current week
    const weekExams = this.examsData.filter((exam) => {
      if (!exam.examDate) {
        console.log('Exam has no exam date:', exam);
        return false;
      }

      const examDate = new Date(exam.examDate);
      const weekStart = new Date(this.currentWeekStart);
      const weekEnd = new Date(this.currentWeekEnd);

      console.log(`Checking exam: ${exam.examType} on ${exam.examDate}`);
      console.log(`Exam date: ${examDate.toDateString()}`);
      console.log(
        `Week start: ${weekStart.toDateString()}, Week end: ${weekEnd.toDateString()}`
      );

      // Check if exam is within the current week
      const isInWeek = examDate >= weekStart && examDate <= weekEnd;
      console.log(`Is in week: ${isInWeek}`);

      return isInWeek;
    });

    console.log(
      `Found ${weekExams.length} exams for the current week:`,
      weekExams
    );
    console.log('=== END PROCESSING EXAMS ===');
  }

  private processHolidays() {
    console.log('Holidays loaded:', this.holidaysData);
    // Process holidays data for display
    // You can transform the holidays data here for your template
  }

  /**
   * Check if a given date falls within any holiday period
   * @param date The date to check
   * @returns holiday object if the date is during a holiday, null otherwise
   */
  private isDateDuringHoliday(date: Date): Holiday | null {
    if (!this.holidaysData || this.holidaysData.length === 0) {
      console.log('No holidays data available');
      return null;
    }

    const dateString = this.formatDate(date);
    console.log(`Checking if date ${dateString} is during any holiday...`);
    console.log(`Available holidays:`, this.holidaysData);

    // Get the year, month, and day of the check date
    const checkYear = date.getFullYear();
    const checkMonth = date.getMonth();
    const checkDay = date.getDate();

    for (const holiday of this.holidaysData) {
      // Parse holiday dates more carefully to avoid timezone issues
      const holidayStartParts = holiday.startDate.split('-');
      const holidayEndParts = holiday.endDate.split('-');

      const startYear = parseInt(holidayStartParts[0]);
      const startMonth = parseInt(holidayStartParts[1]) - 1; // Month is 0-indexed
      const startDay = parseInt(holidayStartParts[2]);

      const endYear = parseInt(holidayEndParts[0]);
      const endMonth = parseInt(holidayEndParts[1]) - 1; // Month is 0-indexed
      const endDay = parseInt(holidayEndParts[2]);

      console.log(
        `Comparing ${dateString} with holiday: ${holiday.title} (${holiday.startDate} to ${holiday.endDate})`
      );
      console.log(`Check date: ${checkYear}-${checkMonth + 1}-${checkDay}`);
      console.log(
        `Holiday start: ${startYear}-${
          startMonth + 1
        }-${startDay}, Holiday end: ${endYear}-${endMonth + 1}-${endDay}`
      );

      // Compare dates by components to avoid timezone issues
      const checkDateValue = checkYear * 10000 + checkMonth * 100 + checkDay;
      const startDateValue = startYear * 10000 + startMonth * 100 + startDay;
      const endDateValue = endYear * 10000 + endMonth * 100 + endDay;

      const withinHoliday =
        checkDateValue >= startDateValue && checkDateValue <= endDateValue;

      console.log(
        `Date values - Check: ${checkDateValue}, Start: ${startDateValue}, End: ${endDateValue}`
      );
      console.log(`Within holiday: ${withinHoliday}`);

      if (withinHoliday) {
        console.log(
          `Date ${dateString} is during holiday: ${holiday.title} (${holiday.startDate} to ${holiday.endDate})`
        );
        return holiday; // Return the holiday object
      }
    }

    console.log(`Date ${dateString} is not during any holiday`);
    return null; // No holiday found for this date
  }

  private processWeeklySchedules() {
    console.log('Processing weekly schedules for courses:', this.courses);
    console.log('Weekly schedules loaded:', this.weeklySchedules);
    console.log('Holidays data available:', this.holidaysData);
    console.log('Current week start:', this.currentWeekStart);
    console.log('Current week end:', this.currentWeekEnd);
    console.log('Reminders available for schedule:', this.reminders);

    // Debug: Log all unique day values to see the exact format
    const uniqueDays = [
      ...new Set(this.weeklySchedules.map((s) => s.dayOfWeek)),
    ];
    console.log('Unique day values in weekly schedules:', uniqueDays);

    // Initialize schedules array for the current week
    this.schedules = [];

    // Create a map of courses by ID for quick lookup
    const courseMap = new Map<number, Course>();
    if (this.courses && this.courses.length > 0) {
      this.courses.forEach((course) => {
        courseMap.set(course.id, course);
      });
    }

    // Get the days of the week for the current week
    const daysOfWeek = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    // Create schedule entries for each day of the current week
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(this.currentWeekStart);
      currentDate.setDate(this.currentWeekStart.getDate() + i);

      const dayName = daysOfWeek[i];
      const dateString = this.formatDate(currentDate);

      console.log(`Processing day ${dayName} (${dateString})`);

      // Check if this date falls within a holiday period
      const holiday = this.isDateDuringHoliday(currentDate);

      if (holiday) {
        console.log(
          `Day ${dayName} (${dateString}) is during a holiday: ${holiday.title} - skipping class schedules`
        );
        // Add a holiday schedule entry for this day
        this.schedules.push({
          day: dayName,
          date: dateString,
          events: [],
          isHoliday: true,
          holidayTitle: holiday.title, // Include the holiday title
        });
        continue; // Skip to next day
      } else {
        console.log(`Day ${dayName} (${dateString}) is NOT during a holiday`);
      }

      // Find all weekly schedules for this day (with strict matching)
      let daySchedules: any[] = [];
      if (this.weeklySchedules && this.weeklySchedules.length > 0) {
        daySchedules = this.weeklySchedules.filter((schedule) => {
          const scheduleDay = schedule.dayOfWeek.toLowerCase().trim();
          const targetDay = dayName.toLowerCase().trim();

          // Try exact match first
          if (scheduleDay === targetDay) {
            return true;
          }

          // Try abbreviated forms with exact matching
          const dayAbbreviations: { [key: string]: string[] } = {
            monday: ['mon'],
            tuesday: ['tue', 'tues'],
            wednesday: ['wed'],
            thursday: ['thu', 'thurs'],
            friday: ['fri'],
            saturday: ['sat'],
            sunday: ['sun'],
          };

          const targetAbbrevs = dayAbbreviations[targetDay] || [];
          const isMatch = targetAbbrevs.some(
            (abbrev) => scheduleDay === abbrev
          );

          if (isMatch) {
            console.log(
              `Matched schedule for ${scheduleDay} to day ${targetDay}`
            );
          }

          return isMatch;
        });
      }

      console.log(`Day ${dayName}: Found ${daySchedules.length} schedules`);

      // Create events for this day
      const dayEvents: any[] = [];

      daySchedules.forEach((schedule) => {
        // Check if schedule has a course object or courseId
        let course: Course | undefined;
        let courseId: number | undefined;

        if (schedule.course && schedule.course.id) {
          // Schedule has a nested course object
          course = schedule.course;
          courseId = schedule.course.id;
        } else if (schedule.courseId) {
          // Schedule has a courseId field
          courseId = schedule.courseId;
          course = courseId ? courseMap.get(courseId) : undefined;
        }

        if (course) {
          // Format time for display
          const startTime = this.formatTime(schedule.startTime);
          const endTime = this.formatTime(schedule.endTime);
          const timeString = `${startTime} - ${endTime}`;

          const event = {
            type: 'Class',
            name: course.courseName,
            time: timeString,
            color: 'bg-indigo-100 text-indigo-800',
            professor: course.professorName,
            room: course.room,
            courseId: course.id,
          };

          dayEvents.push(event);
        }
      });

      // Sort events by start time
      dayEvents.sort((a, b) => {
        const timeA = this.parseTime(a.time.split(' - ')[0]);
        const timeB = this.parseTime(b.time.split(' - ')[0]);
        return timeA - timeB;
      });

      // Add reminders for this day
      let dayReminders: any[] = [];
      if (this.remindersData && this.remindersData.length > 0) {
        dayReminders = this.remindersData.filter((reminder) => {
          if (!reminder.reminderDate) return false;

          const reminderDate = new Date(reminder.reminderDate);
          const currentDateValue =
            currentDate.getFullYear() * 10000 +
            currentDate.getMonth() * 100 +
            currentDate.getDate();
          const reminderDateValue =
            reminderDate.getFullYear() * 10000 +
            reminderDate.getMonth() * 100 +
            reminderDate.getDate();
          const matches = currentDateValue === reminderDateValue;
          console.log(
            `Checking reminder ${reminder.title} for day ${dayName}: ${matches} (current: ${currentDateValue}, reminder: ${reminderDateValue})`
          );
          return matches;
        });
      }

      console.log(
        `Found ${dayReminders.length} reminders for ${dayName}:`,
        dayReminders
      );

      // Convert reminders to events and add to dayEvents
      dayReminders.forEach((reminder) => {
        const reminderEvent = {
          type: 'Reminder',
          name: reminder.title,
          time: reminder.reminderTime || 'All day',
          color: 'bg-yellow-100 text-yellow-800',
          description: reminder.description,
          recurring: reminder.recurring,
          reminderId: reminder.id,
        };
        console.log(`Adding reminder event to ${dayName}:`, reminderEvent);
        dayEvents.push(reminderEvent);
      });

      // Add events for this day
      let dayEventsList: any[] = [];
      if (this.eventsData && this.eventsData.length > 0) {
        dayEventsList = this.eventsData.filter((event) => {
          if (!event.startDate) return false;

          // Parse event dates manually to avoid timezone issues
          const eventStartParts = event.startDate.split('-');
          const eventEndParts = event.endDate
            ? event.endDate.split('-')
            : eventStartParts;

          const eventStartYear = parseInt(eventStartParts[0]);
          const eventStartMonth = parseInt(eventStartParts[1]) - 1; // Month is 0-indexed
          const eventStartDay = parseInt(eventStartParts[2]);

          const eventEndYear = parseInt(eventEndParts[0]);
          const eventEndMonth = parseInt(eventEndParts[1]) - 1; // Month is 0-indexed
          const eventEndDay = parseInt(eventEndParts[2]);

          const currentDateValue =
            currentDate.getFullYear() * 10000 +
            currentDate.getMonth() * 100 +
            currentDate.getDate();
          const eventStartValue =
            eventStartYear * 10000 + eventStartMonth * 100 + eventStartDay;
          const eventEndValue =
            eventEndYear * 10000 + eventEndMonth * 100 + eventEndDay;

          // Check if the current day falls within the event period
          const matches =
            currentDateValue >= eventStartValue &&
            currentDateValue <= eventEndValue;
          console.log(
            `Checking event ${event.title} for day ${dayName}: ${matches} (current: ${currentDateValue}, event: ${eventStartValue}-${eventEndValue})`
          );
          return matches;
        });
      }

      console.log(
        `Found ${dayEventsList.length} events for ${dayName}:`,
        dayEventsList
      );

      // Convert events to schedule events and add to dayEvents
      dayEventsList.forEach((event) => {
        const eventSchedule = {
          type: 'Event',
          name: event.title,
          time: event.startTime
            ? `${event.startTime} - ${event.endTime || ''}`
            : 'All day',
          color: 'bg-green-100 text-green-800',
          description: event.notes || '',
          location: event.location || '',
          eventId: event.id,
        };
        console.log(`Adding event to ${dayName}:`, eventSchedule);
        dayEvents.push(eventSchedule);
      });

      // Add homework for this day
      let dayHomeworkList: any[] = [];
      if (this.homeworkData && this.homeworkData.length > 0) {
        dayHomeworkList = this.homeworkData.filter((homework) => {
          if (!homework.dueDate) return false;

          const homeworkDate = new Date(homework.dueDate);
          const currentDateValue =
            currentDate.getFullYear() * 10000 +
            currentDate.getMonth() * 100 +
            currentDate.getDate();
          const homeworkDateValue =
            homeworkDate.getFullYear() * 10000 +
            homeworkDate.getMonth() * 100 +
            homeworkDate.getDate();

          const matches = currentDateValue === homeworkDateValue;
          console.log(
            `Checking homework ${homework.title} for day ${dayName}: ${matches} (current: ${currentDateValue}, homework: ${homeworkDateValue})`
          );
          return matches;
        });
      }

      console.log(
        `Found ${dayHomeworkList.length} homework assignments for ${dayName}:`,
        dayHomeworkList
      );

      // Convert homework to schedule events and add to dayEvents
      dayHomeworkList.forEach((homework) => {
        const homeworkSchedule = {
          type: 'Homework',
          name: homework.title,
          time: 'Due Today',
          color: 'bg-orange-100 text-orange-800',
          description: homework.description || '',
          status: homework.status || 'Pending',
          courseId: homework.courseId,
          homeworkId: homework.id,
        };
        console.log(`Adding homework to ${dayName}:`, homeworkSchedule);
        dayEvents.push(homeworkSchedule);
      });

      // Add exams for this day
      let dayExamsList: any[] = [];
      if (this.examsData && this.examsData.length > 0) {
        dayExamsList = this.examsData.filter((exam) => {
          if (!exam.examDate) return false;

          const examDate = new Date(exam.examDate);
          const currentDateValue =
            currentDate.getFullYear() * 10000 +
            currentDate.getMonth() * 100 +
            currentDate.getDate();
          const examDateValue =
            examDate.getFullYear() * 10000 +
            examDate.getMonth() * 100 +
            examDate.getDate();

          const matches = currentDateValue === examDateValue;
          console.log(
            `Checking exam ${exam.examType} for day ${dayName}: ${matches} (current: ${currentDateValue}, exam: ${examDateValue})`
          );
          return matches;
        });
      }

      console.log(
        `Found ${dayExamsList.length} exams for ${dayName}:`,
        dayExamsList
      );

      // Convert exams to schedule events and add to dayEvents
      dayExamsList.forEach((exam) => {
        const examSchedule = {
          type: 'Exam',
          name: `${exam.examType} Exam`,
          time: exam.startTime
            ? `${exam.startTime} - ${exam.endTime || ''}`
            : 'All day',
          color: 'bg-red-100 text-red-800',
          description: `Location: ${exam.location || 'TBD'}`,
          examType: exam.examType,
          courseId: exam.courseId,
          examId: exam.id,
        };
        console.log(`Adding exam to ${dayName}:`, examSchedule);
        dayEvents.push(examSchedule);
      });

      // Re-sort all events (classes, events, and reminders) by time
      dayEvents.sort((a, b) => {
        // Define priority order: Classes > Events > Reminders > Homework > Exams
        const getPriority = (type: string) => {
          switch (type) {
            case 'Class':
              return 1;
            case 'Event':
              return 2;
            case 'Reminder':
              return 3;
            case 'Homework':
              return 4;
            case 'Exam':
              return 5;
            default:
              return 6;
          }
        };

        const priorityA = getPriority(a.type);
        const priorityB = getPriority(b.type);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        } else {
          // Same type, sort by time
          const timeA =
            a.type === 'Class' ? this.parseTime(a.time.split(' - ')[0]) : 0;
          const timeB =
            b.type === 'Class' ? this.parseTime(b.time.split(' - ')[0]) : 0;
          return timeA - timeB;
        }
      });

      console.log(`Final events for ${dayName}:`, dayEvents);

      this.schedules.push({
        day: dayName,
        date: dateString,
        events: dayEvents,
        isHoliday: false,
      });
    }

    console.log('Processed schedules:', this.schedules);
  }

  private formatTime(timeString: string): string {
    // Convert time string to readable format (e.g., "14:30" to "2:30 PM")
    if (!timeString) return '';

    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes);

      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch (error) {
      console.error('Error formatting time:', timeString, error);
      return timeString;
    }
  }

  private parseTime(timeString: string): number {
    // Parse time string to minutes for sorting (e.g., "2:30 PM" to 870 minutes)
    if (!timeString) return 0;

    try {
      const [time, period] = timeString.split(' ');
      const [hours, minutes] = time.split(':').map(Number);

      let totalMinutes = hours * 60 + minutes;

      if (period === 'PM' && hours !== 12) {
        totalMinutes += 12 * 60;
      } else if (period === 'AM' && hours === 12) {
        totalMinutes = minutes;
      }

      return totalMinutes;
    } catch (error) {
      console.error('Error parsing time:', timeString, error);
      return 0;
    }
  }

  private calculateDaysLeft(targetDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    targetDate.setHours(0, 0, 0, 0); // Reset time to start of day

    const timeDiff = targetDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff;
  }

  public getDaysLeftText(daysLeft: number): string {
    if (daysLeft < 0) {
      return 'Overdue';
    } else if (daysLeft === 0) {
      return 'Today';
    } else if (daysLeft === 1) {
      return '1 day left';
    } else {
      return `${daysLeft} days left`;
    }
  }
}
