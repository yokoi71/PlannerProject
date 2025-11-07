import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Course } from 'src/app/model/course.model';
import { CourseWeeklySchedule } from 'src/app/model/courseweeklyschedule.model';
import { Student } from 'src/app/model/student.model';
import { StudentDataStorage } from 'src/app/services/student-data-storage/student-data-storage.service';

@Component({
  selector: 'app-update-class-dialog',
  template: `
    <div class="update-dialog-backdrop">
      <div class="update-dialog">
        <h2>Update Class</h2>
        <label for="updateClassDropdown">Select a class to update:</label>
        <select id="updateClassDropdown" [(ngModel)]="selectedId">
          <option [ngValue]="null" disabled>Select a class...</option>
          <option *ngFor="let cls of availableClasses" [ngValue]="cls.id">
            {{ cls.courseName }}
          </option>
        </select>
        <div *ngIf="selectedClass">
          <div class="form-group">
            <label>Course Name:</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="selectedClass.courseName"
            />
          </div>
          <div class="form-group">
            <label>Professor Name:</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="selectedClass.professorName"
            />
          </div>
          <div class="form-group">
            <label>Room:</label>
            <input
              type="text"
              class="form-control"
              [(ngModel)]="selectedClass.room"
            />
          </div>
          <div class="form-group">
            <label>Weekly Course Schedule:</label>
            <div
              *ngIf="
                selectedClass.weeklySchedules &&
                  selectedClass.weeklySchedules.length > 0;
                else noSchedules
              "
            >
              <table style="width:100%; text-align:left;">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="
                      let sched of selectedClass.weeklySchedules;
                      let i = index
                    "
                  >
                    <td>
                      <select [(ngModel)]="sched.dayOfWeek">
                        <option *ngFor="let day of daysOfWeek" [value]="day">
                          {{ day }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <select [(ngModel)]="sched.startTime">
                        <option *ngFor="let t of timeOptions" [value]="t">
                          {{ t }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <select [(ngModel)]="sched.endTime">
                        <option *ngFor="let t of timeOptions" [value]="t">
                          {{ t }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        (click)="removeSchedule(i)"
                        style="color:#e53e3e; background:none; border:none; font-size:1.2em;"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                type="button"
                (click)="addSchedule()"
                style="margin-top:8px;"
                class="btn btn-outline-primary btn-sm"
              >
                Add Schedule
              </button>
            </div>
            <ng-template #noSchedules>
              <div style="color: #888;">
                No weekly schedules found for this class.
              </div>
              <button
                type="button"
                (click)="addSchedule()"
                style="margin-top:8px;"
                class="btn btn-outline-primary btn-sm"
              >
                Add Schedule
              </button>
            </ng-template>
          </div>
        </div>
        <div class="dialog-buttons">
          <button
            class="update"
            [disabled]="!selectedClass"
            (click)="onConfirm()"
          >
            Update
          </button>
          <button class="cancel" (click)="cancel.emit()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .update-dialog-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .update-dialog {
        background: #fff;
        border-radius: 10px;
        padding: 32px 28px 20px 28px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        min-width: 320px;
        text-align: center;
      }
      .update-dialog h2 {
        margin-top: 0;
        color: #2563eb;
        font-size: 1.5rem;
      }
      .update-dialog label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      .update-dialog select {
        width: 100%;
        padding: 8px;
        border-radius: 6px;
        border: 1px solid #cbd5e0;
        margin-bottom: 16px;
        font-size: 1rem;
      }
      .form-group {
        margin-bottom: 16px;
        text-align: left;
      }
      .form-group label {
        font-weight: 500;
        margin-bottom: 4px;
        display: block;
      }
      .form-group input {
        width: 100%;
        padding: 8px;
        border-radius: 6px;
        border: 1px solid #cbd5e0;
        font-size: 1rem;
      }
      .dialog-buttons {
        margin-top: 24px;
        display: flex;
        gap: 16px;
        justify-content: center;
      }
      .update-dialog button {
        padding: 8px 24px;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      .update-dialog button.update {
        background: #2563eb;
        color: #fff;
      }
      .update-dialog button.update:disabled {
        background: #bcd0fa;
        color: #fff;
        cursor: not-allowed;
      }
      .update-dialog button.update:hover:not(:disabled) {
        background: #174ea6;
      }
      .update-dialog button.cancel {
        background: #e2e8f0;
        color: #2d3748;
      }
      .update-dialog button.cancel:hover {
        background: #cbd5e0;
      }
    `,
  ],
})
export class UpdateClassDialogComponent {
  //@Input() availableClasses: any[] = [];
  availableClasses: Course[] = [];
  availableCourseWeeklySchedule: CourseWeeklySchedule[] = [];
  @Input() selectedClassId: number | null = null;
  @Output() confirm = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();
  private studentDataStorageService = inject(StudentDataStorage);

  selectedId: number | null = null;
  selectedClass: any = null;

  daysOfWeek: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  timeOptions: string[] = [];

  ngOnInit() {
    this.selectedId = this.selectedClassId ?? null;

    // Generate time options every 10 minutes from 07:00 to 22:50
    const startHour = 7;
    const endHour = 22;
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let min = 0; min < 60; min += 10) {
        const hourStr = hour.toString().padStart(2, '0');
        const minStr = min.toString().padStart(2, '0');
        this.timeOptions.push(`${hourStr}:${minStr}`);
      }
    }

    const courses = this.studentDataStorageService.getCoursesInfo();
    if (courses && courses.length > 0) {
      this.availableClasses = courses;
    }
    const courseWeeklySchedule =
      this.studentDataStorageService.getCourseWeeklyScheduleInfo();
    if (courseWeeklySchedule && courseWeeklySchedule.length > 0) {
      this.availableCourseWeeklySchedule = courseWeeklySchedule;
    }

    this.updateSelectedClass();
  }

  ngOnChanges() {
    this.updateSelectedClass();
  }

  updateSelectedClass() {
    const found =
      this.availableClasses.find((c) => c.id == this.selectedId) || null;
    if (found) {
      const weeklySchedules = this.availableCourseWeeklySchedule.filter(
        (schedule) => schedule.courseId === this.selectedId
      );
      this.selectedClass = { ...found, weeklySchedules };
    } else {
      this.selectedClass = null;
    }
  }

  onConfirm() {
    if (this.selectedClass) {
      this.confirm.emit(this.selectedClass);
    }
  }

  addSchedule() {
    if (!this.selectedClass.weeklySchedules) {
      this.selectedClass.weeklySchedules = [];
    }
    this.selectedClass.weeklySchedules.push({
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
    });
  }

  removeSchedule(index: number) {
    this.selectedClass.weeklySchedules.splice(index, 1);
  }

  // Watch for dropdown changes
  ngDoCheck() {
    const found = this.availableClasses.find((c) => c.id == this.selectedId);
    // if (!found || (this.selectedClass && found.id !== this.selectedClass.id)) {
    if (found) {
      this.updateSelectedClass();
    }
  }
}
