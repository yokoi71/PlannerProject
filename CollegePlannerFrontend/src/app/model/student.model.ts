export class Student {
  public id: number;
  public name: string;
  public email: string;
  public dateOfBirth: string;
  public schoolName: string;
  public grade: string;
  public gender: string;

  constructor(
    id?: number,
    name?: string,
    email?: string,
    dateOfBirth?: string,
    schoolName?: string,
    grade?: string,
    gender?: string
  ) {
    this.id = id || 0;
    this.name = name || '';
    this.email = email || '';
    this.dateOfBirth = dateOfBirth || '';
    this.schoolName = schoolName || '';
    this.grade = grade || '';
    this.gender = gender || '';
  }
}
