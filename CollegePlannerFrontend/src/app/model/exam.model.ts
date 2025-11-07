export class Exam {
  public id: number;
  public courseId: number;
  public examType: string;
  public examDate: string;
  public startTime: string;
  public endTime: string;
  public location: string;
  public reminderDaysBefore: number;

  constructor(
    id?: number,
    courseId?: number,
    examType?: string,
    examDate?: string,
    startTime?: string,
    endTime?: string,
    location?: string,
    reminderDaysBefore?: number
  ) {
    this.id = id || 0;
    this.courseId = courseId || 0;
    this.examType = examType || '';
    this.examDate = examDate || '';
    this.startTime = startTime || '';
    this.endTime = endTime || '';
    this.location = location || '';
    this.reminderDaysBefore = reminderDaysBefore || 0;
  }
}
