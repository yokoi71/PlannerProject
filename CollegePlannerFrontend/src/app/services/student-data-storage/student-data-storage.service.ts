import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppConstants } from 'src/app/constants/app.constants';
import { Course } from 'src/app/model/course.model';
import { CourseWeeklySchedule } from 'src/app/model/courseweeklyschedule.model';
import { Exam } from 'src/app/model/exam.model';
import { Holiday } from 'src/app/model/holiday.model';
import { Homework } from 'src/app/model/homework.model';
import { Reminder } from 'src/app/model/reminder.model';
import { Semester } from 'src/app/model/semester.model';
import { Student } from 'src/app/model/student.model';
import { environment } from 'src/environments/environment';
import { Event as PlannerEvent } from 'src/app/model/event.model';

@Injectable({ providedIn: 'root' })
export class StudentDataStorage {
  student = new Student();
  semesters: Semester[] = [];
  courses: Course[] = [];
  courseWeeklySchedule: CourseWeeklySchedule[] = [];
  homework: Homework[] = [];
  exams: Exam[] = [];
  reminders: Reminder[] = [];
  events: PlannerEvent[] = [];
  holidays: Holiday[] = [];

  // set methods
  setStudentInfo(studentInfo: Student) {
    this.student = studentInfo;
  }
  setSemesterInfo(semestersInfo: Semester[]) {
    this.semesters = semestersInfo;
  }

  setCoursesInfo(coursesInfo: Course[]) {
    this.courses = coursesInfo;
  }

  setCourseWeeklyScheduleInfo(
    courseWeeklyScheduleInfo: CourseWeeklySchedule[]
  ) {
    this.courseWeeklySchedule = courseWeeklyScheduleInfo;
  }

  setHomeworkInfo(homeworkInfo: Homework[]) {
    this.homework = homeworkInfo;
  }

  setExamsInfo(examsInfo: Exam[]) {
    this.exams = examsInfo;
  }

  setRemindersInfo(remindersInfo: Reminder[]) {
    this.reminders = remindersInfo;
  }

  setEventsInfo(eventsInfo: PlannerEvent[]) {
    this.events = eventsInfo;
  }

  setHoidaysInfo(holidaysInfo: Holiday[]) {
    this.holidays = holidaysInfo;
  }

  //get methods
  getStudentInfo() {
    return this.student;
  }
  getSemesterInfo() {
    return this.semesters;
  }
  getCoursesInfo() {
    return this.courses;
  }

  getCourseWeeklyScheduleInfo() {
    return this.courseWeeklySchedule;
  }

  getHomeworkInfo() {
    return this.homework;
  }

  getExamsInfo() {
    return this.exams;
  }

  getRemindersInfo() {
    return this.reminders;
  }

  getEventsInfo() {
    return this.events;
  }

  getHoidaysInfo() {
    return this.holidays;
  }
}
