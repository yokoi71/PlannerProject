export class Homework {
  public id: number;
  public courseId: number;
  public title: string;
  public description: string;
  public dueDate: string;
  public status: string;
  public reminderDaysBefore: number;

  constructor(
    id?: number,
    courseId?: number,
    title?: string,
    description?: string,
    dueDate?: string,
    status?: string,
    reminderDaysBefore?: number
  ) {
    this.id = id || 0;
    this.courseId = courseId || 0;
    this.title = title || '';
    this.description = description || '';
    this.dueDate = dueDate || '';
    this.status = status || '';
    this.reminderDaysBefore = reminderDaysBefore || 0;
  }
}
