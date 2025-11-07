import { Component, EventEmitter, Input, Output } from '@angular/core';

interface ClassInfo {
  id: number;
  courseName: string;
  professorName?: string;
  room?: string;
}

@Component({
  selector: 'app-delete-class-dialog',
  template: `
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <!-- Header -->
        <div class="bg-red-600 rounded-t-xl p-6 text-white">
          <div class="flex items-center">
            <i class="fas fa-trash text-2xl mr-4"></i>
            <div>
              <h2 class="text-2xl font-bold">Delete Class</h2>
              <p class="text-red-100">Remove a class from your schedule</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="mb-6">
            <label
              for="deleteClassDropdown"
              class="block text-sm font-semibold text-blue-800 mb-2"
            >
              <i class="fas fa-list text-blue-600 mr-2"></i>
              Select a class to delete:
            </label>
            <select
              id="deleteClassDropdown"
              [(ngModel)]="selectedId"
              class="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option [ngValue]="null" disabled>Select a class...</option>
              <option *ngFor="let cls of availableClasses" [ngValue]="cls.id">
                {{ cls.courseName }}
              </option>
            </select>
          </div>

          <div *ngIf="selectedClass()" class="bg-blue-50 rounded-lg p-6 mb-6">
            <h3
              class="text-lg font-semibold text-blue-900 mb-4 border-b-2 border-blue-200 pb-3"
            >
              <i class="fas fa-info-circle text-blue-600 mr-3"></i>
              Class Details
            </h3>

            <div class="space-y-3">
              <div class="flex">
                <span class="font-semibold text-blue-800 w-24">Course:</span>
                <span class="text-blue-900">{{
                  selectedClass()?.courseName
                }}</span>
              </div>
              <div class="flex">
                <span class="font-semibold text-blue-800 w-24">Professor:</span>
                <span class="text-blue-900">{{
                  selectedClass()?.professorName || 'N/A'
                }}</span>
              </div>
              <div class="flex">
                <span class="font-semibold text-blue-800 w-24">Room:</span>
                <span class="text-blue-900">{{
                  selectedClass()?.room || 'N/A'
                }}</span>
              </div>
            </div>

            <div
              *ngIf="
                selectedClass()?.weeklySchedules &&
                selectedClass()?.weeklySchedules.length > 0
              "
              class="mt-6"
            >
              <h4 class="font-semibold text-blue-800 mb-3">Class Schedule:</h4>
              <div
                class="bg-white rounded-lg overflow-hidden border border-blue-200"
              >
                <table class="w-full">
                  <thead class="bg-blue-100">
                    <tr>
                      <th
                        class="px-4 py-3 text-left text-sm font-semibold text-blue-900"
                      >
                        Day
                      </th>
                      <th
                        class="px-4 py-3 text-left text-sm font-semibold text-blue-900"
                      >
                        Start Time
                      </th>
                      <th
                        class="px-4 py-3 text-left text-sm font-semibold text-blue-900"
                      >
                        End Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      *ngFor="let sched of selectedClass()?.weeklySchedules"
                      class="border-t border-blue-200"
                    >
                      <td class="px-4 py-3 text-sm text-blue-900">
                        {{ sched.dayOfWeek }}
                      </td>
                      <td class="px-4 py-3 text-sm text-blue-900">
                        {{ sched.startTime }}
                      </td>
                      <td class="px-4 py-3 text-sm text-blue-900">
                        {{ sched.endTime }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div
            *ngIf="selectedClassName()"
            class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
          >
            <div class="flex items-center">
              <i class="fas fa-exclamation-triangle text-yellow-600 mr-3"></i>
              <p class="text-yellow-800">
                Are you sure you want to delete
                <strong>{{ selectedClassName() }}</strong
                >?
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div
            class="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t-2 border-blue-200"
          >
            <button
              class="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-300 transition-colors duration-200 transform hover:scale-105"
              (click)="cancel.emit()"
            >
              <i class="fas fa-times mr-2"></i>
              Cancel
            </button>
            <button
              class="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 focus:ring-4 focus:ring-red-300 transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              [disabled]="!selectedId"
              (click)="onConfirm()"
            >
              <i class="fas fa-trash mr-2"></i>
              Delete Class
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class DeleteClassDialogComponent {
  @Input() availableClasses: ClassInfo[] = [];
  @Input() selectedClassId: number | null = null;
  @Output() confirm = new EventEmitter<number>();
  @Output() cancel = new EventEmitter<void>();

  selectedId: number | null = null;

  ngOnInit() {
    this.selectedId = null;
  }

  selectedClassName(): string {
    const found = this.availableClasses.find((c) => c.id == this.selectedId);
    return found ? found.courseName : '';
  }

  selectedClass() {
    const cls = this.availableClasses.find((c) => c.id == this.selectedId);
    if (!cls) return undefined;
    const courseWeeklySchedule =
      (
        window as any
      ).studentDataStorageService?.getCourseWeeklyScheduleInfo?.() || [];
    return {
      ...cls,
      weeklySchedules: courseWeeklySchedule.filter(
        (s: any) => s.courseId === cls.id
      ),
    };
  }

  onConfirm() {
    if (this.selectedId) {
      this.confirm.emit(this.selectedId);
    }
  }
}
