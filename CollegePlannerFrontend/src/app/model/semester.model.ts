export class Semester {
  public id: number;
  public studentId: number;
  public year: number;
  public term: string;
  public startDate: string;
  public endDate: string;

  constructor(
    id?: number,
    studentId?: number,
    year?: number,
    term?: string,
    startDate?: string,
    endDate?: string
  ) {
    this.id = id || 0;
    this.studentId = studentId || 0;
    this.year = year || 0;
    this.term = term || '';
    this.startDate = startDate || '';
    this.endDate = endDate || '';
  }
}
