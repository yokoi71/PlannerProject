import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { AppConstants } from '../../constants/app.constants';
import { environment } from '../../../environments/environment';
import { Contact } from '../../model/contact.model';
import { Semester } from 'src/app/model/semester.model';
import { Student } from 'src/app/model/student.model';
import {
  Observable,
  tap,
  forkJoin,
  switchMap,
  from,
  concatMap,
  of,
  lastValueFrom,
} from 'rxjs';
import { Course } from 'src/app/model/course.model';
import { Reminder } from 'src/app/model/reminder.model';
import { CourseWeeklySchedule } from 'src/app/model/courseweeklyschedule.model';
import { Homework } from 'src/app/model/homework.model';
import { Exam } from 'src/app/model/exam.model';
import { CsrfService } from '../csrf.service';
import { Holiday } from 'src/app/model/holiday.model';
import { Event } from 'src/app/model/event.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  constructor(private http: HttpClient, private csrfService: CsrfService) {}

  ///////////GET requests //////////////////
  getStudentInfo(id: number) {
    return this.http.get<Student>(
      environment.rooturl + AppConstants.STUDENTINFO_API_URL + '?id=' + id,
      { observe: 'response', withCredentials: true }
    );
  }

  getSemester(id: number) {
    const params = new HttpParams().set('id', id);
    return this.http.get<Semester[]>(
      environment.rooturl + AppConstants.SEMESTERS_API_URL,
      {
        params,
        observe: 'response',
        withCredentials: true,
      }
    );
  }

  getCourses(semesterId: number) {
    const params = new HttpParams().set('id', semesterId);
    return this.http.get<Course[]>(
      environment.rooturl + AppConstants.COURSES_API_URL,
      {
        params,
        observe: 'response',
        withCredentials: true,
      }
    );
  }

  // getReminders(semesterId: number) {
  //   const params = new HttpParams().set('id', semesterId);
  //   return this.http.get<Reminder[]>(
  //     environment.rooturl + AppConstants.REMINDERS_API_URL,
  //     {
  //       params,
  //       observe: 'response',
  //       withCredentials: true,
  //     }
  //   );
  // }

  // Get reminders for a student
  getReminders(studentId: number) {
    const params = new HttpParams().set('studentId', studentId.toString());
    return this.http.get<Reminder[]>(
      environment.rooturl + AppConstants.REMINDERS_API_URL,
      { params, observe: 'response', withCredentials: true }
    );
  }

  // Set (add or update) a reminder
  setReminder(reminder: Reminder) {
    if (reminder.id && reminder.id > 0) {
      // Update existing reminder
      return this.csrfService.withCookieBasedCsrf(() =>
        this.http.put<Reminder>(
          environment.rooturl + AppConstants.REMINDERS_API_URL,
          reminder,
          { observe: 'response', withCredentials: true }
        )
      );
    } else {
      // Add new reminder
      return this.csrfService.withCookieBasedCsrf(() =>
        this.http.post<Reminder>(
          environment.rooturl + AppConstants.REMINDERS_API_URL,
          reminder,
          { observe: 'response', withCredentials: true }
        )
      );
    }
  }

  // Get holidays for a student

  getHolidays(studentId: number) {
    const params = new HttpParams().set('studentId', studentId.toString());
    return this.http.get<Holiday[]>(
      environment.rooturl + AppConstants.HOLIDAYS_API_URL,
      {
        params,
        observe: 'response',
        withCredentials: true,
      }
    );
  }

  // Set (add or update) a holiday
  setHoliday(holiday: Holiday) {
    if (holiday.id && holiday.id > 0) {
      // Update existing holiday
      return this.csrfService.withCookieBasedCsrf(() =>
        this.http.put<Holiday>(
          environment.rooturl + AppConstants.HOLIDAYS_API_URL,
          holiday,
          {
            observe: 'response',
            withCredentials: true,
          }
        )
      );
    } else {
      // Add new holiday
      return this.csrfService.withCookieBasedCsrf(() =>
        this.http.post<Holiday>(
          environment.rooturl + AppConstants.HOLIDAYS_API_URL,
          holiday,
          {
            observe: 'response',
            withCredentials: true,
          }
        )
      );
    }
  }

  // Get events for a student
  getEvents(studentId: number) {
    const params = new HttpParams().set('studentId', studentId.toString());
    return this.http.get<Event[]>(environment.rooturl + '/myEvents', {
      params,
      observe: 'response',
      withCredentials: true,
    });
  }

  // Set (add or update) an event
  setEvent(event: Event) {
    if (event.id && event.id > 0) {
      // Update existing event
      return this.csrfService.withCookieBasedCsrf(() =>
        this.http.put<Event>(environment.rooturl + '/myEvents', event, {
          observe: 'response',
          withCredentials: true,
        })
      );
    } else {
      // Add new event
      return this.csrfService.withCookieBasedCsrf(() =>
        this.http.post<Event>(environment.rooturl + '/myEvents', event, {
          observe: 'response',
          withCredentials: true,
        })
      );
    }
  }

  getCourseWeeklySchedule(courseId: number) {
    const params = new HttpParams().set('id', courseId);
    return this.http.get<CourseWeeklySchedule[]>(
      environment.rooturl + AppConstants.COURSE_WEEKLY_SCHEDULE_API_URL,
      {
        params,
        observe: 'response',
        withCredentials: true,
      }
    );
  }

  getHomework(courseId: number) {
    const params = new HttpParams().set('courseId', courseId);
    return this.http.get<Homework[]>(
      environment.rooturl + AppConstants.HOMEWORK_API_URL,
      {
        params,
        observe: 'response',
        withCredentials: true,
      }
    );
  }
  getExams(courseId: number) {
    const params = new HttpParams().set('courseId', courseId);
    return this.http.get<Exam[]>(
      environment.rooturl + AppConstants.EXAMS_API_URL,
      {
        params,
        observe: 'response',
        withCredentials: true,
      }
    );
  }

  ///////////GET requests to remove later //////////////////
  getAccountDetails(id: number) {
    return this.http.get(
      environment.rooturl + AppConstants.ACCOUNT_API_URL + '?id=' + id,
      { observe: 'response', withCredentials: true }
    );
  }

  getAccountTransactions(id: number) {
    return this.http.get(
      environment.rooturl + AppConstants.BALANCE_API_URL + '?id=' + id,
      { observe: 'response', withCredentials: true }
    );
  }

  getLoansDetails(id: number) {
    return this.http.get(
      environment.rooturl + AppConstants.LOANS_API_URL + '?id=' + id,
      { observe: 'response', withCredentials: true }
    );
  }

  getCardsDetails(id: number) {
    return this.http.get(
      environment.rooturl + AppConstants.CARDS_API_URL + '?id=' + id,
      { observe: 'response', withCredentials: true }
    );
  }

  getNoticeDetails() {
    return this.http.get(environment.rooturl + AppConstants.NOTICES_API_URL, {
      observe: 'response',
    });
  }

  saveMessage(contact: Contact) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.post(
        environment.rooturl + AppConstants.CONTACT_API_URL,
        contact,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
    );
  }

  ///////////POST requests //////////////////
  addCourse(courseRequest: any) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.post<Course>(
        environment.rooturl + '/addCourse',
        courseRequest,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
    );
  }

  addCourseWeeklySchedule(scheduleRequest: any) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.post<CourseWeeklySchedule>(
        environment.rooturl + '/addCourseWeeklySchedule',
        scheduleRequest,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
    );
  }

  addReminder(reminder: Reminder) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.post<Reminder>(
        environment.rooturl + AppConstants.REMINDERS_API_URL,
        reminder,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  addHomework(homework: Homework) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.post<Homework>(
        environment.rooturl + AppConstants.HOMEWORK_API_URL,
        homework,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  addExam(exam: Exam) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.post<Exam>(
        environment.rooturl + AppConstants.EXAMS_API_URL,
        exam,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  addEvent(event: Event) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.post<Event>(
        environment.rooturl + AppConstants.EVENTS_API_URL,
        event,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  addHoiday(holiday: Holiday) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.post<Holiday>(
        environment.rooturl + AppConstants.HOLIDAYS_API_URL,
        holiday,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  addSemester(semester: Semester) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.post<Semester>(
        environment.rooturl + AppConstants.SEMESTERS_API_URL,
        semester,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  updateSemester(semester: Semester) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.put<Semester>(
        environment.rooturl + AppConstants.SEMESTERS_API_URL,
        semester,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  updateStudentInfo(student: Student) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.put(
        environment.rooturl + AppConstants.UPDATE_STUDENTINFO_API_URL,
        student,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
    );
  }

  updateEvent(event: Event) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.put<Event>(
        environment.rooturl + AppConstants.EVENTS_API_URL,
        event,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  updateReminder(reminder: Reminder) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.put<Reminder>(
        environment.rooturl + AppConstants.REMINDERS_API_URL,
        reminder,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  updateExam(exam: Exam) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.put<Exam>(
        environment.rooturl + AppConstants.EXAMS_API_URL,
        exam,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  updateHomework(homework: Homework) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.put<Homework>(
        environment.rooturl + AppConstants.HOMEWORK_API_URL,
        homework,
        { observe: 'response', withCredentials: true }
      )
    );
  }

  updateHolidays(holidays: Holiday) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.put<Holiday>(
        environment.rooturl + AppConstants.HOLIDAYS_API_URL,
        holidays,
        { observe: 'response', withCredentials: true }
      )
    );
  }
  ///////////DELETE requests //////////////////
  deleteCourse(courseId: number) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.delete(environment.rooturl + `/deleteCourse/${courseId}`, {
        observe: 'response',
        withCredentials: true,
      })
    );
  }

  deleteCourseWeeklySchedule(courseId: number) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.delete(
        environment.rooturl + `/deleteCourseWeeklySchedule/${courseId}`,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
    );
  }

  deleteReminder(reminderId: number) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.delete(
        environment.rooturl + AppConstants.REMINDERS_API_URL + '/' + reminderId,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
    );
  }

  deleteHomework(homeworkId: number) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.delete(
        environment.rooturl + AppConstants.HOMEWORK_API_URL + '/' + homeworkId,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
    );
  }

  deleteExam(examId: number) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.delete(
        environment.rooturl + AppConstants.EXAMS_API_URL + '/' + examId,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
    );
  }

  // Delete an event by id
  deleteEvent(eventId: number) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.delete(
        environment.rooturl + AppConstants.EVENTS_API_URL + '/' + eventId,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
    );
  }

  // Delete a holiday by id
  deleteHoliday(id: number) {
    return this.csrfService.withCookieBasedCsrf(() =>
      this.http.delete(
        environment.rooturl + AppConstants.HOLIDAYS_API_URL + '/' + id,
        {
          observe: 'response',
          withCredentials: true,
        }
      )
    );
  }

  /**
   * Deletes all course weekly schedules for a course sequentially, then deletes the course itself.
   * @param courseId The course ID to delete
   * @param scheduleIds The array of courseWeeklySchedule IDs to delete (no longer used)
   */
  deleteCourseAndSchedules(courseId: number, scheduleIds: number[]) {
    // Now just call the new endpoint once for the courseId
    return this.deleteCourseWeeklySchedule(courseId).pipe(
      concatMap(() => this.deleteCourse(courseId))
    );
  }
}
