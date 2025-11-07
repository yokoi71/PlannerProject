import { Component, inject } from '@angular/core';
import { Student } from 'src/app/model/student.model';
import { User } from 'src/app/model/user.model';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { StudentDataStorage } from 'src/app/services/student-data-storage/student-data-storage.service';
import { tap, switchMap } from 'rxjs';

@Component({
  selector: 'app-studentinfo',
  templateUrl: './studentinfo.component.html',
  styleUrls: ['./studentinfo.component.css'],
})
export class StudentinfoComponent {
  student!: Student;
  private studentDataStorageService = inject(StudentDataStorage);
  private dashboardService = inject(DashboardService);

  ngOnInit(): void {
    this.student = this.studentDataStorageService.getStudentInfo();
  }

  saveStudentInfo() {
    this.dashboardService.updateStudentInfo(this.student).subscribe({
      next: (response) => {
        this.studentDataStorageService.setStudentInfo(this.student);
        alert('Student information updated successfully!');
      },
      error: (err) => {
        alert('Failed to update student information.');
      },
    });
  }
}
