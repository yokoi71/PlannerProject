export class Holiday {
  public id: number;
  public studentId: number;
  public title: string;
  public year: number;
  public startDate: string;
  public endDate: string;

  constructor(
    id?: number,
    studentId?: number,
    title?: string,
    year?: number,
    startDate?: string,
    endDate?: string
  ) {
    this.id = id || 0;
    this.studentId = studentId || 0;
    this.title = title || '';
    this.year = year || 0;
    this.startDate = startDate || '';
    this.endDate = endDate || '';
  }
}
