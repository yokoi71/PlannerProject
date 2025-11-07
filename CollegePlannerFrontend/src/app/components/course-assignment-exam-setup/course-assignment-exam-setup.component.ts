import { Component, OnInit, inject } from '@angular/core';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { StudentDataStorage } from '../../services/student-data-storage/student-data-storage.service';
import { Semester } from '../../model/semester.model';
import { Course } from '../../model/course.model';
import { Homework } from '../../model/homework.model';
import { Exam } from '../../model/exam.model';

@Component({
  selector: 'app-course-assignment-exam-setup',
  templateUrl: './course-assignment-exam-setup.component.html',
  styleUrls: ['./course-assignment-exam-setup.component.css'],
})
export class CourseAssignmentExamSetupComponent implements OnInit {
  semesters = ['Spring', 'Summer', 'Fall', 'Winter'];
  currentYear = new Date().getFullYear();
  nextYear = this.currentYear + 1;

  // Semester selection
  private _selectedSemester: string | null = null;
  get selectedSemester(): string | null {
    return this._selectedSemester;
  }
  set selectedSemester(value: string | null) {
    this._selectedSemester = value;
    if (value) {
      this.loadCoursesForSemester();
    }
  }

  // Courses for selected semester
  courses: Course[] = [];

  // Homework and Exam maps for each course
  homeworkMap: { [courseId: number]: Homework[] } = {};
  examMap: { [courseId: number]: Exam[] } = {};

  // Inject services
  private dashboardService = inject(DashboardService);
  private studentDataStorageService = inject(StudentDataStorage);

  semestersInfo: Semester[] = [];
  studentId: number = 0;

  ngOnInit(): void {
    this.loadSemesterData();
  }

  private loadSemesterData() {
    // Get student info
    const student = this.studentDataStorageService.getStudentInfo();
    if (student && student.id) {
      this.studentId = student.id;
    }

    // Get semesters from storage
    this.semestersInfo = this.studentDataStorageService.getSemesterInfo();

    if (!this.semestersInfo || this.semestersInfo.length === 0) {
      // Load from backend if not in storage
      this.loadSemestersFromBackend();
    }
  }

  private loadSemestersFromBackend() {
    if (!this.studentId) {
      console.error('No student ID available');
      return;
    }

    this.dashboardService.getSemester(this.studentId).subscribe({
      next: (response) => {
        if (response.body) {
          this.semestersInfo = response.body;
          this.studentDataStorageService.setSemesterInfo(this.semestersInfo);
        }
      },
      error: (err) => {
        console.error('Failed to load semesters:', err);
      },
    });
  }

  private loadCoursesForSemester() {
    if (!this.selectedSemester) return;

    // Parse year and term from selectedSemester
    const match = this.selectedSemester.match(
      /(\d+)-(Spring|Summer|Fall|Winter)/
    );
    if (!match) return;

    const year = parseInt(match[1], 10);
    const term = match[2];

    // Find the semester in semestersInfo
    const semester = this.semestersInfo.find(
      (s) => s.year === year && s.term === term
    );

    if (semester) {
      // First, try to get courses from student data storage
      this.loadCoursesFromStorage(semester.id);
    }
  }

  private loadCoursesFromStorage(semesterId: number) {
    // Get all courses from storage
    const allCourses = this.studentDataStorageService.getCoursesInfo();

    if (!allCourses || allCourses.length === 0) {
      // If no courses in storage, get from backend
      this.loadCoursesFromBackend(semesterId);
    } else {
      // Filter courses for the selected semester
      this.courses = allCourses.filter(
        (course) => course.semesterId === semesterId
      );

      if (this.courses.length === 0) {
        // If no courses found for this semester, try backend
        this.loadCoursesFromBackend(semesterId);
      } else {
        // Load homework and exams for courses from storage
        this.loadHomeworkAndExamsForCourses();
      }
    }
  }

  private loadCoursesFromBackend(semesterId: number) {
    this.dashboardService.getCourses(semesterId).subscribe({
      next: (response) => {
        if (response.body) {
          this.courses = response.body;
          // Store courses in student data storage
          this.studentDataStorageService.setCoursesInfo(this.courses);
          // Load homework and exams for each course
          this.loadHomeworkAndExamsForCourses();
        }
      },
      error: (err) => {
        console.error('Failed to load courses:', err);
      },
    });
  }

  private loadHomeworkAndExamsForCourses() {
    // Always send GET requests to retrieve homework and exam data from backend
    this.courses.forEach((course) => {
      this.loadHomeworkForCourse(course.id);
      this.loadExamsForCourse(course.id);
    });
  }

  private loadHomeworkForCourse(courseId: number) {
    this.dashboardService.getHomework(courseId).subscribe({
      next: (response) => {
        if (response.body) {
          this.homeworkMap[courseId] = response.body;
          // Store in student data storage service
          this.updateStoredHomework();
        }
      },
      error: (err) => {
        console.error(`Failed to load homework for course ${courseId}:`, err);
        this.homeworkMap[courseId] = [];
      },
    });
  }

  private loadExamsForCourse(courseId: number) {
    this.dashboardService.getExams(courseId).subscribe({
      next: (response) => {
        if (response.body) {
          this.examMap[courseId] = response.body;
          // Store in student data storage service
          this.updateStoredExams();
        }
      },
      error: (err) => {
        console.error(`Failed to load exams for course ${courseId}:`, err);
        this.examMap[courseId] = [];
      },
    });
  }

  private updateStoredHomework() {
    // Collect all homework from all courses
    const allHomework: Homework[] = [];
    Object.values(this.homeworkMap).forEach((homeworkArray) => {
      allHomework.push(...homeworkArray);
    });
    this.studentDataStorageService.setHomeworkInfo(allHomework);
    console.log('New Homework data stored to StudentDataStorageService');
    console.log(allHomework);
  }

  private updateStoredExams() {
    // Collect all exams from all courses
    const allExams: Exam[] = [];
    Object.values(this.examMap).forEach((examArray) => {
      allExams.push(...examArray);
    });
    this.studentDataStorageService.setExamsInfo(allExams);
    console.log('New exam data stored to StudentDataStorageService');
    console.log(allExams);
  }

  // Refresh homework and exams for a specific course
  private refreshCourseData(courseId: number) {
    this.loadHomeworkForCourse(courseId);
    this.loadExamsForCourse(courseId);
  }

  // Get homework for a course
  getHomeworkForCourse(courseId: number): Homework[] {
    if (!this.homeworkMap[courseId]) {
      this.homeworkMap[courseId] = [];
    }
    return this.homeworkMap[courseId];
  }

  // Get exams for a course
  getExamsForCourse(courseId: number): Exam[] {
    if (!this.examMap[courseId]) {
      this.examMap[courseId] = [];
    }
    return this.examMap[courseId];
  }

  // Add homework for a course
  addHomework(courseId: number) {
    if (!this.homeworkMap[courseId]) {
      this.homeworkMap[courseId] = [];
    }
    const newHomework = new Homework(0, courseId, '', '', '', 'Pending', 0);
    this.homeworkMap[courseId].push(newHomework);
  }

  // Add exam for a course
  addExam(courseId: number) {
    if (!this.examMap[courseId]) {
      this.examMap[courseId] = [];
    }
    const newExam = new Exam(0, courseId, 'Other', '', '', '', '', 0);
    this.examMap[courseId].push(newExam);
  }

  // Save homework
  saveHomework(courseId: number, index: number) {
    const homework = this.homeworkMap[courseId][index];
    if (!homework) return;

    if (homework.id && homework.id > 0) {
      // Update existing homework
      this.dashboardService.updateHomework(homework).subscribe({
        next: (response) => {
          if (response.body) {
            this.homeworkMap[courseId][index] = response.body;
            alert('Homework updated successfully!');
            // Refresh the data to ensure consistency
            this.refreshCourseData(courseId);
          }
        },
        error: (err) => {
          alert('Failed to update homework!');
          console.error(err);
        },
      });
    } else {
      // Add new homework
      this.dashboardService.addHomework(homework).subscribe({
        next: (response) => {
          if (response.body) {
            this.homeworkMap[courseId][index] = response.body;
            alert('Homework added successfully!');
            // Refresh the data to ensure consistency
            this.refreshCourseData(courseId);
          }
        },
        error: (err) => {
          alert('Failed to add homework!');
          console.error(err);
        },
      });
    }
  }

  // Save exam
  saveExam(courseId: number, index: number) {
    const exam = this.examMap[courseId][index];
    if (!exam) return;

    if (exam.id && exam.id > 0) {
      // Update existing exam
      this.dashboardService.updateExam(exam).subscribe({
        next: (response) => {
          if (response.body) {
            this.examMap[courseId][index] = response.body;
            alert('Exam updated successfully!');
            // Refresh the data to ensure consistency
            this.refreshCourseData(courseId);
          }
        },
        error: (err) => {
          alert('Failed to update exam!');
          console.error(err);
        },
      });
    } else {
      // Add new exam
      this.dashboardService.addExam(exam).subscribe({
        next: (response) => {
          if (response.body) {
            this.examMap[courseId][index] = response.body;
            alert('Exam added successfully!');
            // Refresh the data to ensure consistency
            this.refreshCourseData(courseId);
          }
        },
        error: (err) => {
          alert('Failed to add exam!');
          console.error(err);
        },
      });
    }
  }

  // Delete homework
  deleteHomework(courseId: number, index: number) {
    const homework = this.homeworkMap[courseId][index];
    if (!homework) return;

    if (homework.id && homework.id > 0) {
      // Delete from backend
      this.dashboardService.deleteHomework(homework.id).subscribe({
        next: () => {
          this.homeworkMap[courseId].splice(index, 1);
          alert('Homework deleted successfully!');
          // Refresh the data to ensure consistency
          this.refreshCourseData(courseId);
        },
        error: (err) => {
          alert('Failed to delete homework!');
          console.error(err);
        },
      });
    } else {
      // Remove from local array
      this.homeworkMap[courseId].splice(index, 1);
    }
  }

  // Delete exam
  deleteExam(courseId: number, index: number) {
    const exam = this.examMap[courseId][index];
    if (!exam) return;

    if (exam.id && exam.id > 0) {
      // Delete from backend
      this.dashboardService.deleteExam(exam.id).subscribe({
        next: () => {
          this.examMap[courseId].splice(index, 1);
          alert('Exam deleted successfully!');
          // Refresh the data to ensure consistency
          this.refreshCourseData(courseId);
        },
        error: (err: any) => {
          alert('Failed to delete exam!');
          console.error(err);
        },
      });
    } else {
      // Remove from local array
      this.examMap[courseId].splice(index, 1);
    }
  }
}
