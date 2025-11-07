import { Component, OnInit, inject } from '@angular/core';
import { User } from 'src/app/model/user.model';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { StudentDataStorage } from 'src/app/services/student-data-storage/student-data-storage.service';
import { tap, switchMap } from 'rxjs';
import { Student } from 'src/app/model/student.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  user = new User();
  student = new Student();

  private studentDataStorageService = inject(StudentDataStorage);

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    if (sessionStorage.getItem('userdetails')) {
      this.user = JSON.parse(sessionStorage.getItem('userdetails') || '');
    }
    console.log('user details:');
    console.log(this.user);

    //get Student info and Semesters for current logged-in user.
    if (this.user) {
      this.dashboardService
        .getStudentInfo(this.user.id)
        .pipe(
          tap((responseData) => {
            console.log(responseData.body);
            this.studentDataStorageService.setStudentInfo(
              responseData.body ?? new Student()
            );
          }),
          switchMap((student) =>
            this.dashboardService.getSemester(this.user.id)
          ),
          tap((responseData) => {
            console.log('Original semesters from API:', responseData.body);

            const semestersFromApi = responseData.body ?? [];

            // Transform to the expected format
            const formattedSemesters = semestersFromApi.map((semester: any) => {
              return {
                id: semester.id,
                studentId: semester.student?.id ?? 0, // Extract student.id
                year: semester.year,
                term: semester.term,
                startDate: semester.startDate,
                endDate: semester.endDate,
              };
            });

            console.log(
              'Formatted semesters with numeric studentId:',
              formattedSemesters
            );

            // Store the transformed semesters
            this.studentDataStorageService.setSemesterInfo(formattedSemesters);
            // console.log(responseData.body);
            // this.studentDataStorageService.setSemesterInfo(
            //   responseData.body ?? []
            // );
          })
        )
        .subscribe({
          next: () => {
            console.log(
              'Student Info and Semester data stored successfully in Student Data Storage service'
            );
          },
          error: (err) => {
            console.error(
              'Error loading Student Info and/or Semester data:',
              err
            );
          },
        });
    }
  }
}
