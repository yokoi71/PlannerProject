import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Holiday } from 'src/app/model/holiday.model';
import { Reminder } from 'src/app/model/reminder.model';
import { Semester } from 'src/app/model/semester.model';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { StudentDataStorage } from 'src/app/services/student-data-storage/student-data-storage.service';
import { Event as PlannerEvent } from 'src/app/model/event.model';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Component({
  selector: 'app-semester-setup',
  templateUrl: './semester-setup.component.html',
})
export class SemesterSetupComponent implements OnInit {
  // Semester and year options
  semesters = ['Spring', 'Summer', 'Fall', 'Winter'];
  currentYear = new Date().getFullYear();
  nextYear = this.currentYear + 1;

  // Dropdown value: e.g. '2024-spring'
  private _selectedSemester: string | null = null;
  get selectedSemester(): string | null {
    return this._selectedSemester;
  }
  set selectedSemester(value: string | null) {
    this._selectedSemester = value;
    this.prepopulateSemesterDates();
  }

  prepopulateSemesterDates() {
    if (!this._selectedSemester || !this.semestersInfo) return;
    // Parse year and term from the selectedSemester string
    const match = this._selectedSemester.match(
      /(\d+)-(Spring|Summer|Fall|Winter)/
    );
    if (!match) return;
    const year = parseInt(match[1], 10);
    const term = match[2];
    // Find the semester in semestersInfo
    const found = this.semestersInfo.find(
      (s) => s.year === year && s.term === term
    );
    if (found) {
      this.semesterSettingsMap[this._selectedSemester] = {
        startDate: found.startDate,
        endDate: found.endDate,
      };
    }
  }

  // Settings for each semester (in-memory only)
  semesterSettingsMap: {
    [key: string]: { startDate: string; endDate: string };
  } = {};

  // Holidays for the selected semester (in-memory only)
  holidaysMap: {
    [key: string]: {
      name: string;
      startDate: string;
      endDate: string;
      _id?: number;
    }[];
  } = {};

  // Events for the selected semester (in-memory only)
  eventsMap: {
    [key: string]: {
      name: string;
      startDate: string;
      endDate: string;
      startTime: string;
      endTime: string;
      location: string;
      notes: string;
      reminderDays: number;
    }[];
  } = {};

  remindersMap: {
    [key: string]: {
      title: string;
      description: string;
      reminderDate: string;
      reminderTime: string;
      recurring: string;
    }[];
  } = {};

  private dashboardService = inject(DashboardService);
  private studentDataStorageService = inject(StudentDataStorage);
  private destroyRef = inject(DestroyRef);
  // studentInfo : Student | null = null;
  semestersInfo: Semester[] = [];
  remindersInfo: Reminder[] = [];
  eventsInfo: PlannerEvent[] = [];
  holidaysInfo: Holiday[] = [];
  studentId: number = 0;

  // Toast notification system
  toastMessages: ToastMessage[] = [];
  private nextToastId = 1;

  ngOnInit(): void {
    this.LoadSettingData();
  }

  LoadSettingData() {
    console.log('lets load some semester-setting data');
    // Try to get student info from local storage/service
    const studentInfo = this.studentDataStorageService.getStudentInfo();

    if (studentInfo && studentInfo.id && studentInfo.id > 0) {
      // Student info exists locally, use it to get other info
      this.studentId = studentInfo.id;
      // Get from local storage/service
      this.semestersInfo = this.studentDataStorageService.getSemesterInfo();
      this.remindersInfo = this.studentDataStorageService.getRemindersInfo();
      this.eventsInfo = this.studentDataStorageService.getEventsInfo();
      this.holidaysInfo = this.studentDataStorageService.getHoidaysInfo();

      // You can now use semestersInfo, remindersInfo, eventsInfo as needed
      // For example, assign to component properties or maps
      // this.semesterSettingsMap = ... (transform as needed)
      // this.holidaysMap = ... (transform as needed)
      // this.eventsMap = ... (transform as needed)
      if (this.semestersInfo.length <= 0) {
        const subscription = this.dashboardService
          .getSemester(this.studentId)
          .subscribe({
            next: (semestersResponse) => {
              const semesters = semestersResponse.body ?? [];
              this.studentDataStorageService.setSemesterInfo(semesters);
              this.semestersInfo = semesters;
              // ...assign to component property if needed

              console.log(
                'Semester data stored successfully in Student Data Storage service'
              );
              console.log(this.semestersInfo);
            },
            error: (err) => {
              console.error('Error loading Semester data:', err);
            },
          });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
      }

      if (this.remindersInfo.length <= 0) {
        const subscription = this.dashboardService
          .getReminders(this.studentId)
          .subscribe({
            next: (remindersResponse) => {
              this.studentDataStorageService.setRemindersInfo(
                remindersResponse.body ?? []
              );
              this.remindersInfo = remindersResponse.body ?? [];
              console.log(
                'Reminder data stored successfully in Student Data Storage service'
              );
              console.log(this.remindersInfo);

              // Populate all maps
              this.populateReminderMaps();
            },
            error: (err) => {
              console.error('Error loading Reminder data:', err);
              this.holidaysMap = {};
            },
          });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
      } else {
        // Populate all maps
        this.populateReminderMaps();
      }

      if (this.eventsInfo.length <= 0) {
        const subscription = this.dashboardService
          .getEvents(this.studentId)
          .subscribe({
            next: (eventsResponse) => {
              this.studentDataStorageService.setEventsInfo(
                (eventsResponse.body as PlannerEvent[]) ?? []
              );
              this.eventsInfo = (eventsResponse.body as PlannerEvent[]) ?? [];
              console.log(
                'Event data stored successfully in Student Data Storage service'
              );
              console.log(this.eventsInfo);

              // Populate all maps
              this.populateEventMaps();
            },
            error: (err) => {
              console.error('Error loading Event data:', err);
              this.eventsMap = {};
            },
          });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
      } else {
        // Populate all maps
        this.populateEventMaps();
      }

      if (this.holidaysInfo.length <= 0) {
        const subscription = this.dashboardService
          .getHolidays(this.studentId)
          .subscribe({
            next: (holidaysResponse) => {
              this.studentDataStorageService.setHoidaysInfo(
                holidaysResponse.body ?? []
              );
              this.holidaysInfo = holidaysResponse.body ?? [];
              console.log(
                'Holiday data stored successfully in Student Data Storage service'
              );
              console.log(this.holidaysInfo);

              // Populate all maps
              this.populateHolidayMaps();
            },
            error: (err) => {
              console.error('Error loading Holiday data:', err);
              this.holidaysMap = {};
            },
          });
        this.destroyRef.onDestroy(() => subscription.unsubscribe());
      } else {
        // Populate all maps
        this.populateHolidayMaps();
      }
    }

    /*
    //load courses based on semester id
    if (this.selectedSemester) {
      const subscription = this.dashboardService
        .getCourses(this.selectedSemester.id)
        .pipe(
          tap((responseData) => {
            console.log('Original courses from API:', responseData.body);

            const coursesFromApi = responseData.body ?? [];

            // Transform to the expected format
            const formattedCourses = coursesFromApi.map((course: any) => {
              return {
                id: course.id,
                semesterId: course.semester.id,
                courseName: course.courseName,
                professorName: course.professorName,
                room: course.room,
              };
            });

            console.log(
              'Formatted courses with numeric semesterId:',
              formattedCourses
            );

            // Store the transformed semesters
            this.studentDataStorageService.setCoursesInfo(formattedCourses);
            // Assign colors after courses are loaded
            this.assignColorsToCourses();
          }),
          switchMap((responseData) => {
            const courses = responseData.body ?? [];

            const courseScheduleRequests = courses.map((course) =>
              this.dashboardService.getCourseWeeklySchedule(course.id)
            );

            return forkJoin(courseScheduleRequests);
          }),
          tap((allResponses) => {
            const allSchedulesFromApi = allResponses.flatMap(
              (res: any) => res.body ?? []
            );

            console.log(
              'Original weekly course schedule from API:',
              allSchedulesFromApi
            );

            // Transform to the expected format
            const formattedSchedules = allSchedulesFromApi.map(
              (schedule: any) => {
                return {
                  id: schedule.id,
                  courseId: schedule.course.id,
                  dayOfWeek: schedule.dayOfWeek,
                  startTime: schedule.startTime,
                  endTime: schedule.endTime,
                };
              }
            );

            console.log(
              'Formatted weekly course schedule with numeric courseId:',
              formattedSchedules
            );

            // Store the transformed semesters
            this.studentDataStorageService.setCourseWeeklyScheduleInfo(
              formattedSchedules
            );
          })
        )
        .subscribe({
          next: () => {
            console.log(
              'Course data stored successfully in Student Data Storage service'
            );
          },
          error: (err) => {
            console.error(
              'Error loading Student Info and/or Semester data:',
              err
            );
          },
        });
    }
        */
  }

  // Generic function to populate maps from backend data
  private populateHolidayMaps() {
    // Populate holidaysMap
    this.holidaysMap = {};
    for (const holiday of this.holidaysInfo) {
      const semesterKey = `${holiday.year}`;
      if (!this.holidaysMap[semesterKey]) {
        this.holidaysMap[semesterKey] = [];
      }
      this.holidaysMap[semesterKey].push({
        name: holiday.title,
        startDate: holiday.startDate,
        endDate: holiday.endDate,
        _id: holiday.id, // Preserve the holiday ID for updates
      });
    }
  }

  private populateReminderMaps() {
    // Populate remindersMap
    this.remindersMap = {};
    for (const reminder of this.remindersInfo) {
      let key = '';
      if (reminder.reminderDate) {
        const date = new Date(reminder.reminderDate);
        const year = date.getFullYear();
        // Map to semester keys (e.g., "2024-Spring", "2024-Summer", etc.)
        // For now, map all reminders to the first semester of the year
        key = `${year}-Spring`;
      }
      if (!this.remindersMap[key]) this.remindersMap[key] = [];
      this.remindersMap[key].push({
        title: reminder.title,
        description: reminder.description,
        reminderDate: reminder.reminderDate,
        reminderTime: reminder.reminderTime,
        recurring: reminder.recurring || 'None',
      });
    }
    // console.log('RemindersMap keys:', Object.keys(this.remindersMap));
  }

  private populateEventMaps() {
    // Populate eventsMap
    this.eventsMap = {};
    for (const event of this.eventsInfo) {
      let key = '';
      if (event.startDate) {
        const date = new Date(event.startDate);
        const year = date.getFullYear();
        // Map to semester keys (e.g., "2024-Spring", "2024-Summer", etc.)
        // For now, map all events to the first semester of the year
        key = `${year}-Spring`;
      }
      if (!this.eventsMap[key]) this.eventsMap[key] = [];
      this.eventsMap[key].push({
        name: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        notes: event.notes,
        reminderDays: event.reminderDaysBefore || 0,
      });
    }
    //console.log('EventsMap keys:', Object.keys(this.eventsMap));
  }

  // Get all events (not filtered by semester)
  get events() {
    //console.log('eventsMap keys:', Object.keys(this.eventsMap));
    // Return all events from all semesters, sorted by keys to ensure consistent order
    const allEvents: any[] = [];
    const sortedKeys = Object.keys(this.eventsMap).sort();
    sortedKeys.forEach((key) => {
      allEvents.push(...this.eventsMap[key]);
    });
    //console.log('All events:', allEvents);
    return allEvents;
  }

  // Get all reminders (not filtered by semester)
  get reminders() {
    // console.log('remindersMap keys:', Object.keys(this.remindersMap));
    // Return all reminders from all semesters, sorted by keys to ensure consistent order
    const allReminders: any[] = [];
    const sortedKeys = Object.keys(this.remindersMap).sort();
    sortedKeys.forEach((key) => {
      allReminders.push(...this.remindersMap[key]);
    });
    // console.log('All reminders:', allReminders);
    return allReminders;
  }

  // Get current semester settings
  get semesterSettings() {
    if (!this.selectedSemester) return { startDate: '', endDate: '' };
    if (!this.semesterSettingsMap[this.selectedSemester]) {
      this.semesterSettingsMap[this.selectedSemester] = {
        startDate: '',
        endDate: '',
      };
    }
    return this.semesterSettingsMap[this.selectedSemester];
  }

  set semesterSettings(val: { startDate: string; endDate: string }) {
    if (this.selectedSemester) {
      this.semesterSettingsMap[this.selectedSemester] = val;
    }
  }

  // Get holidays for the selected semester
  get holidays() {
    if (!this.selectedSemester) return [];
    if (!this.holidaysMap[this.selectedSemester]) {
      this.holidaysMap[this.selectedSemester] = [];
    }
    return this.holidaysMap[this.selectedSemester];
  }

  // Add a new holiday
  addHoliday() {
    // Add a new holiday at the end of the last year in holidaysMap
    const newHoliday = {
      name: '',
      startDate: '',
      endDate: '',
    };
    // Find the last year key in holidaysMap, or use current year if empty
    const yearKeys = Object.keys(this.holidaysMap);
    let year =
      yearKeys.length > 0
        ? yearKeys[yearKeys.length - 1]
        : `${this.currentYear}`;
    if (!this.holidaysMap[year]) {
      this.holidaysMap[year] = [];
    }
    this.holidaysMap[year] = [...this.holidaysMap[year], newHoliday];
  }

  // Delete a holiday by index
  deleteHoliday(index: number) {
    const all = this.allHolidays;
    if (index < 0 || index >= all.length) return;
    const holiday = all[index];
    // Check if this holiday exists in holidaysInfo (by name, startDate, endDate)
    const existing = this.holidaysInfo.find(
      (h) =>
        h.title === holiday.name &&
        h.startDate === holiday.startDate &&
        h.endDate === holiday.endDate
    );
    // If the holiday exists in the backend, send DELETE request
    if (existing && existing.id) {
      this.dashboardService.deleteHoliday(existing.id).subscribe({
        next: () => {
          // Remove from all years in holidaysMap
          for (const y in this.holidaysMap) {
            this.holidaysMap[y] = this.holidaysMap[y].filter(
              (h) => h !== holiday
            );
          }
          // Remove from holidaysInfo
          this.holidaysInfo = this.holidaysInfo.filter(
            (h) => h.id !== existing.id
          );
        },
        error: (err) => {
          alert('Failed to delete holiday!');
          console.error(err);
        },
      });
    } else {
      // Remove from all years in holidaysMap immediately if new
      for (const y in this.holidaysMap) {
        this.holidaysMap[y] = this.holidaysMap[y].filter((h) => h !== holiday);
      }
    }
  }

  // Add a new event
  addEvent() {
    // Add to the last (most recent) key or create a default key
    const keys = Object.keys(this.eventsMap).sort();
    const key =
      keys.length > 0 ? keys[keys.length - 1] : `${this.currentYear}-Spring`;
    if (!this.eventsMap[key]) {
      this.eventsMap[key] = [];
    }
    this.eventsMap[key].push({
      name: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      notes: '',
      reminderDays: 0,
    });
  }

  // Delete an event by index
  deleteEvent(index: number) {
    const events = this.events;
    if (index < 0 || index >= events.length) return;
    const event = events[index];
    // Try to find the id from eventsInfo
    const info = this.eventsInfo.find(
      (e) =>
        e.title === event.name &&
        e.startDate === event.startDate &&
        e.endDate === event.endDate &&
        e.startTime === event.startTime &&
        e.endTime === event.endTime
    );
    if (info && info.id) {
      this.dashboardService.deleteEvent(info.id).subscribe({
        next: () => {
          this.showToast('Event deleted successfully!', 'success');
          // Remove from eventsInfo array
          this.eventsInfo = this.eventsInfo.filter((e) => e.id !== info.id);
          // Remove from all maps
          Object.keys(this.eventsMap).forEach((key) => {
            this.eventsMap[key] = this.eventsMap[key].filter((e, i) => {
              // Find the event in this key's array and remove it
              return !(
                e.name === event.name &&
                e.startDate === event.startDate &&
                e.endDate === event.endDate &&
                e.startTime === event.startTime &&
                e.endTime === event.endTime
              );
            });
          });
        },
        error: (err) => {
          this.showToast('Failed to delete event!', 'error');
          console.error(err);
        },
      });
    } else {
      // Remove from all maps
      Object.keys(this.eventsMap).forEach((key) => {
        this.eventsMap[key] = this.eventsMap[key].filter((e, i) => {
          return !(
            e.name === event.name &&
            e.startDate === event.startDate &&
            e.endDate === event.endDate &&
            e.startTime === event.startTime &&
            e.endTime === event.endTime
          );
        });
      });
    }
  }

  // Add a new reminder
  addReminder() {
    // Add to the last (most recent) key or create a default key
    const keys = Object.keys(this.remindersMap).sort();
    const key =
      keys.length > 0 ? keys[keys.length - 1] : `${this.currentYear}-Spring`;
    if (!this.remindersMap[key]) {
      this.remindersMap[key] = [];
    }
    this.remindersMap[key].push({
      title: '',
      description: '',
      reminderDate: '',
      reminderTime: '',
      recurring: 'None',
    });
  }

  // Delete a reminder by index
  deleteReminder(index: number) {
    const reminders = this.reminders;
    if (index < 0 || index >= reminders.length) return;
    const reminder = reminders[index];
    // Try to find the id from remindersInfo
    const info = this.remindersInfo.find(
      (r) =>
        r.title === reminder.title &&
        r.reminderDate === reminder.reminderDate &&
        r.reminderTime === reminder.reminderTime
    );
    if (info && info.id) {
      this.dashboardService.deleteReminder(info.id).subscribe({
        next: () => {
          this.showToast('Reminder deleted successfully!', 'success');
          // Remove from remindersInfo array
          this.remindersInfo = this.remindersInfo.filter(
            (r) => r.id !== info.id
          );
          // Remove from all maps
          Object.keys(this.remindersMap).forEach((key) => {
            this.remindersMap[key] = this.remindersMap[key].filter((r, i) => {
              return !(
                r.title === reminder.title &&
                r.reminderDate === reminder.reminderDate &&
                r.reminderTime === reminder.reminderTime
              );
            });
          });
        },
        error: (err) => {
          this.showToast('Failed to delete reminder!', 'error');
          console.error(err);
        },
      });
    } else {
      // Remove from all maps
      Object.keys(this.remindersMap).forEach((key) => {
        this.remindersMap[key] = this.remindersMap[key].filter((r, i) => {
          return !(
            r.title === reminder.title &&
            r.reminderDate === reminder.reminderDate &&
            r.reminderTime === reminder.reminderTime
          );
        });
      });
    }
  }

  // Save semester settings (send to backend)
  saveSemesterSettings() {
    if (!this.selectedSemester || !this.studentId) {
      alert('No semester or student selected!');
      return;
    }
    // Parse year and term from the selectedSemester string
    const match = this.selectedSemester.match(
      /(\d+)-(Spring|Summer|Fall|Winter)/
    );
    if (!match) {
      alert('Invalid semester format!');
      return;
    }
    const year = parseInt(match[1], 10);
    const term = match[2];
    const settings = this.semesterSettingsMap[this.selectedSemester];
    if (!settings) {
      alert('No settings to save!');
      return;
    }
    // Check if semester already exists in semestersInfo
    let semester = this.semestersInfo.find(
      (s) => s.year === year && s.term === term
    );
    if (!semester) {
      // Create new semester object
      semester = new Semester(
        0,
        this.studentId,
        year,
        term,
        settings.startDate,
        settings.endDate
      );
      const subscription = this.dashboardService
        .addSemester(semester)
        .subscribe({
          next: (response) => {
            alert('Semester settings saved successfully!');
            // Optionally update local storage/semestersInfo
          },
          error: (err) => {
            alert('Failed to save semester settings!');
            console.error(err);
          },
        });
      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    } else {
      // Update existing semester
      semester.startDate = settings.startDate;
      semester.endDate = settings.endDate;
      const subscription = this.dashboardService
        .updateSemester(semester)
        .subscribe({
          next: (response) => {
            alert('Semester settings updated successfully!');
            // Optionally update local storage/semestersInfo
          },
          error: (err) => {
            alert('Failed to update semester settings!');
            console.error(err);
          },
        });
      this.destroyRef.onDestroy(() => subscription.unsubscribe());
    }
  }

  get allHolidays() {
    // Flatten all holidays from holidaysMap into a single array
    return Object.values(this.holidaysMap).flat();
  }

  saveHoliday(index: number) {
    const all = this.allHolidays;
    if (index < 0 || index >= all.length) return;
    const holiday = all[index];

    // Validate required fields
    if (!holiday.name || holiday.name.trim() === '') {
      this.showToast('Please enter a holiday name.', 'error');
      return;
    }

    if (!holiday.startDate) {
      this.showToast('Please select a start date.', 'error');
      return;
    }

    if (!holiday.endDate) {
      this.showToast('Please select an end date.', 'error');
      return;
    }

    // Validate that end date is not before start date
    const startDate = new Date(holiday.startDate);
    const endDate = new Date(holiday.endDate);
    if (endDate < startDate) {
      this.showToast('End date cannot be before start date.', 'error');
      return;
    }

    // Determine the year from startDate
    const year = holiday.startDate
      ? new Date(holiday.startDate).getFullYear().toString()
      : `${this.currentYear}`;
    // Check if this holiday exists in holidaysInfo (by name, startDate, endDate)
    // For updates, we need to find the existing holiday more reliably
    let existing: Holiday | undefined = undefined;

    // First try to find by ID if the holiday object has an _id property
    if ((holiday as any)._id) {
      existing = this.holidaysInfo.find((h) => h.id === (holiday as any)._id);
    }

    // If not found by ID, try to find by matching properties
    if (!existing) {
      existing = this.holidaysInfo.find(
        (h) =>
          h.title === holiday.name &&
          h.startDate === holiday.startDate &&
          h.endDate === holiday.endDate
      );
    }
    const holidayToSave = {
      id: existing ? existing.id : 0,
      studentId: this.studentId,
      title: holiday.name.trim(),
      year: parseInt(year, 10),
      startDate: holiday.startDate,
      endDate: holiday.endDate,
    };

    console.log('Saving holiday:', holidayToSave);
    console.log('Existing holiday found:', existing);
    this.dashboardService.setHoliday(holidayToSave).subscribe({
      next: (response) => {
        console.log('Holiday saved successfully:', response);
        this.showToast('Holiday saved successfully!', 'success');

        // Update holidaysInfo with the response data
        if (response.body && response.body.id) {
          if (existing) {
            // Update existing holiday in holidaysInfo
            const infoIndex = this.holidaysInfo.findIndex(
              (h) => h.id === existing!.id
            );
            if (infoIndex !== -1) {
              this.holidaysInfo[infoIndex] = response.body as Holiday;
            }
          } else {
            // Add new holiday to holidaysInfo
            this.holidaysInfo.push(response.body as Holiday);
          }
        }

        // Update the holidaysMap to reflect the changes
        const yearKey = year.toString();

        if (existing) {
          // Update existing holiday in holidaysMap
          if (this.holidaysMap[yearKey]) {
            const mapIndex = this.holidaysMap[yearKey].findIndex(
              (h) => h._id === existing!.id
            );
            if (mapIndex !== -1) {
              this.holidaysMap[yearKey][mapIndex] = {
                name: holidayToSave.title,
                startDate: holidayToSave.startDate,
                endDate: holidayToSave.endDate,
                _id: existing.id,
              };
            }
          }
        } else {
          // Add new holiday to holidaysMap
          if (!this.holidaysMap[yearKey]) {
            this.holidaysMap[yearKey] = [];
          }
          if (response.body && response.body.id) {
            this.holidaysMap[yearKey].push({
              name: holidayToSave.title,
              startDate: holidayToSave.startDate,
              endDate: holidayToSave.endDate,
              _id: response.body.id as number,
            });
          }
        }

        // Note: Form clearing removed due to type issues
        // The UI will update automatically due to the holidaysMap changes above
      },
      error: (err) => {
        this.showToast('Failed to save holiday!', 'error');
        console.error(err);
      },
    });
  }

  saveEvent(index: number) {
    const events = this.events;
    if (index < 0 || index >= events.length) return;
    const event = events[index];

    // Validation
    if (!event.name || event.name.trim() === '') {
      this.showToast('Please enter an event name.', 'error');
      return;
    }
    if (!event.startDate) {
      this.showToast('Please select a start date.', 'error');
      return;
    }
    if (!event.endDate) {
      this.showToast('Please select an end date.', 'error');
      return;
    }
    if (!event.startTime) {
      this.showToast('Please select a start time.', 'error');
      return;
    }
    if (!event.endTime) {
      this.showToast('Please select an end time.', 'error');
      return;
    }

    // Check if this event exists in eventsInfo
    const existing = this.eventsInfo.find(
      (e) =>
        e.title === event.name &&
        e.startDate === event.startDate &&
        e.endDate === event.endDate &&
        e.startTime === event.startTime &&
        e.endTime === event.endTime
    );

    const eventToSave = {
      id: existing ? existing.id : 0,
      studentId: this.studentId,
      title: event.name.trim(),
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location ? event.location.trim() : '',
      notes: event.notes ? event.notes.trim() : '',
      reminderDaysBefore: event.reminderDays || 0,
    };

    this.dashboardService.setEvent(eventToSave).subscribe({
      next: (response) => {
        this.showToast('Event saved successfully!', 'success');
        if (response.body && response.body.id) {
          (event as any)._id = response.body.id;
          if (!existing) {
            this.eventsInfo.push({
              id: response.body.id,
              studentId: this.studentId,
              title: event.name,
              startDate: event.startDate,
              endDate: event.endDate,
              startTime: event.startTime,
              endTime: event.endTime,
              location: event.location,
              notes: event.notes,
              reminderDaysBefore: event.reminderDays,
            });
          }
        }
      },
      error: (err) => {
        this.showToast('Failed to save event!', 'error');
        console.error(err);
      },
    });
  }

  // Save a reminder
  saveReminder(index: number) {
    const reminders = this.reminders;
    if (index < 0 || index >= reminders.length) return;
    const reminder = reminders[index];
    // Validation
    if (!reminder.title || reminder.title.trim() === '') {
      this.showToast('Please enter a reminder title.', 'error');
      return;
    }
    if (!reminder.reminderDate) {
      this.showToast('Please select a reminder date.', 'error');
      return;
    }
    if (!reminder.reminderTime) {
      this.showToast('Please select a reminder time.', 'error');
      return;
    }
    // Check if this reminder exists in remindersInfo
    const existing = this.remindersInfo.find(
      (r) =>
        r.title === reminder.title &&
        r.reminderDate === reminder.reminderDate &&
        r.reminderTime === reminder.reminderTime
    );
    const reminderToSave = {
      id: existing ? existing.id : 0,
      studentId: this.studentId,
      title: reminder.title.trim(),
      description: reminder.description.trim(),
      reminderDate: reminder.reminderDate,
      reminderTime: reminder.reminderTime,
      recurring: reminder.recurring,
    };
    this.dashboardService.setReminder(reminderToSave).subscribe({
      next: (response) => {
        this.showToast('Reminder saved successfully!', 'success');
        if (response.body && response.body.id) {
          (reminder as any)._id = response.body.id;
          if (!existing) {
            this.remindersInfo.push({
              id: response.body.id,
              studentId: this.studentId,
              title: reminder.title,
              description: reminder.description,
              reminderDate: reminder.reminderDate,
              reminderTime: reminder.reminderTime,
              recurring: reminder.recurring,
            });
          }
        }
      },
      error: (err) => {
        this.showToast('Failed to save reminder!', 'error');
        console.error(err);
      },
    });
  }

  // Toast notification methods
  showToast(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = 5000
  ) {
    const toast: ToastMessage = {
      id: this.nextToastId++,
      message,
      type,
      duration,
    };

    this.toastMessages.push(toast);

    // Auto-remove toast after duration
    setTimeout(() => {
      this.removeToast(toast.id);
    }, duration);
  }

  removeToast(id: number) {
    this.toastMessages = this.toastMessages.filter((toast) => toast.id !== id);
  }
}
