export class Event {
  public id: number;
  public studentId: number;
  public title: string;
  public startDate: string;
  public endDate: string;
  public startTime: string;
  public endTime: string;
  public location: string;
  public notes: string;
  public reminderDaysBefore: number;

  constructor(
    id?: number,
    studentId?: number,
    title?: string,
    startDate?: string,
    endDate?: string,
    startTime?: string,
    endTime?: string,
    location?: string,
    notes?: string,
    reminderDaysBefore?: number
  ) {
    this.id = id || 0;
    this.studentId = studentId || 0;
    this.title = title || '';
    this.startDate = startDate || '';
    this.endDate = endDate || '';
    this.startTime = startTime || '';
    this.endTime = endTime || '';
    this.location = location || '';
    this.notes = notes || '';
    this.reminderDaysBefore = reminderDaysBefore || 0;
  }
}
