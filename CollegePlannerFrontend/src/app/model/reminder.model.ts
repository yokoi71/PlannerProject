export class Reminder {
  public id: number;
  public studentId: number;
  public title: string;
  public description: string;
  public reminderDate: string;
  public reminderTime: string;
  public recurring: string;

  constructor(
    id?: number,
    studentId?: number,
    title?: string,
    description?: string,
    reminderDate?: string,
    reminderTime?: string,
    recurring?: string
  ) {
    this.id = id || 0;
    this.studentId = studentId || 0;
    this.title = title || '';
    this.description = description || '';
    this.reminderDate = reminderDate || '';
    this.reminderTime = reminderTime || '';
    this.recurring = recurring || '';
  }
}
