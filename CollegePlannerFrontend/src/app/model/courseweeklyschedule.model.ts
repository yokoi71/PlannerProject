import { Course } from './course.model';

export class CourseWeeklySchedule {
  public id: number;
  public courseId: number;
  public dayOfWeek: string;
  public startTime: string;
  public endTime: string;
  public course?: Course; // Optional course object for nested data

  constructor(
    id?: number,
    courseId?: number,
    dayOfWeek?: string,
    startTime?: string,
    endTime?: string,
    course?: Course
  ) {
    this.id = id || 0;
    this.courseId = courseId || 0;
    this.dayOfWeek = dayOfWeek || '';
    this.startTime = startTime || '';
    this.endTime = endTime || '';
    this.course = course;
  }
}
