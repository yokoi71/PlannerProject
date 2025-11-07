export class Course {
  public id: number;
  public semesterId: number;
  public courseName: string;
  public professorName: string;
  public room: string;

  constructor(
    id?: number,
    semesterId?: number,
    courseName?: string,
    professorName?: string,
    room?: string
  ) {
    this.id = id || 0;
    this.semesterId = semesterId || 0;
    this.courseName = courseName || '';
    this.professorName = professorName || '';
    this.room = room || '';
  }
}
