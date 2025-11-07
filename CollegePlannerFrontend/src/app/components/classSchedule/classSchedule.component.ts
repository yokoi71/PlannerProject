import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { User } from 'src/app/model/user.model';
import { StudentDataStorage } from 'src/app/services/student-data-storage/student-data-storage.service';
import { Semester } from 'src/app/model/semester.model';
import { tap, switchMap, forkJoin } from 'rxjs';
import { CourseWeeklySchedule } from 'src/app/model/courseweeklyschedule.model';
import { Course } from 'src/app/model/course.model';

@Component({
  selector: 'app-classschedule',
  templateUrl: './classschedule.component.html',
  styleUrls: ['./classschedule.component.css'],
})
export class ClassScheduleComponent implements OnInit {
  days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  hours = Array.from({ length: 11 }, (_, i) => i + 7); // 7 to 17 (7 AM to 5 PM)

  timeSlots: string[] = [];

  user = new User();
  selectedSemester: Semester | null = null;
  userId = '';
  studentDataStorageService = inject(StudentDataStorage);
  semesters: Semester[] = [];
  currentClassName = '';
  showAddClass = false;
  availableClasses: any[] = [];
  selectedClassId: number | null = null;

  courseColors: { [courseId: number]: string } = {};

  // Expanded pastel color palette with more unique colors
  pastelColors: string[] = [
    '#FFD1DC', // pastel pink
    '#B5EAD7', // pastel green
    '#C7CEEA', // pastel purple
    '#FFDAC1', // pastel peach
    '#B5D8FF', // pastel blue
    '#FFFACD', // pastel yellow
    '#E2F0CB', // pastel mint
    '#FFB7B2', // pastel coral
    '#D5C6E0', // pastel lavender
    '#F1F0C0', // pastel lemon
    '#FFE4E1', // misty rose
    '#E6E6FA', // lavender
    '#F0F8FF', // alice blue
    '#F5F5DC', // beige
    '#FFEFD5', // papaya whip
    '#E0FFFF', // light cyan
    '#F0FFF0', // honeydew
    '#FFF0F5', // lavender blush
    '#FDF5E6', // old lace
    '#F5F5F5', // white smoke
    '#E8F5E8', // mint cream
    '#FFF8DC', // cornsilk
    '#F0F8FF', // alice blue
    '#FFFAF0', // floral white
    '#F8F8FF', // ghost white
    '#F5FFFA', // mint cream
    '#FFF5EE', // seashell
    '#F0FFFF', // azure
    '#FFFAFA', // snow
    '#F0F0F0', // gainsboro
    '#E6F3FF', // light sky blue
    '#F0FFF0', // honeydew
    '#FFF0F5', // lavender blush
    '#F5F5DC', // beige
    '#E0F6FF', // light blue
    '#F0F8FF', // alice blue
    '#FFF8DC', // cornsilk
    '#E8F5E8', // mint cream
    '#FDF5E6', // old lace
    '#F5F5F5', // white smoke
  ];

  // Track used colors to prevent duplicates
  usedColors: Set<string> = new Set();

  // Generate a new pastel color that's visually distinct from existing ones
  generateUniquePastelColor(): string {
    // If we have unused colors from our palette, use them first
    for (const color of this.pastelColors) {
      if (!this.usedColors.has(color)) {
        this.usedColors.add(color);
        return color;
      }
    }

    // If all palette colors are used, generate a new pastel color
    // Ensure it's visually distinct from existing colors
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      // Generate a pastel color with controlled saturation and lightness
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.floor(Math.random() * 30) + 20; // 20-50% saturation for pastel
      const lightness = Math.floor(Math.random() * 20) + 70; // 70-90% lightness for pastel

      const newColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

      // Check if this color is too similar to any existing color
      let isTooSimilar = false;
      for (const usedColor of this.usedColors) {
        if (this.areColorsSimilar(usedColor, newColor)) {
          isTooSimilar = true;
          break;
        }
      }

      if (!isTooSimilar) {
        this.usedColors.add(newColor);
        return newColor;
      }

      attempts++;
    }

    // Fallback: return a gray color if we can't generate a unique one
    return '#E0E0E0';
  }

  // Check if two colors are visually similar
  areColorsSimilar(color1: string, color2: string): boolean {
    // Convert colors to RGB for comparison
    const rgb1 = this.hexToRgb(color1) || this.hslToRgb(color1);
    const rgb2 = this.hexToRgb(color2) || this.hslToRgb(color2);

    if (!rgb1 || !rgb2) return false;

    // Calculate Euclidean distance between colors
    const distance = Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
        Math.pow(rgb1.g - rgb2.g, 2) +
        Math.pow(rgb1.b - rgb2.b, 2)
    );

    // Colors are similar if distance is less than 50 (adjustable threshold)
    return distance < 50;
  }

  // Convert hex color to RGB
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    if (hex.startsWith('#')) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    }
    return null;
  }

  // Convert HSL color to RGB
  hslToRgb(hsl: string): { r: number; g: number; b: number } | null {
    const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (!match) return null;

    const h = parseInt(match[1]) / 360;
    const s = parseInt(match[2]) / 100;
    const l = parseInt(match[3]) / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  }

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.generateTimeSlots();

    this.semesters = this.studentDataStorageService.getSemesterInfo();

    //select a default semester based on current date.
    this.selectedSemester = this.semesters[0] ?? null;
    if (this.selectedSemester) {
      const currentYear = new Date().getFullYear();
      const thisMonth = new Date().getMonth() + 1;
      let currentTerm = '';
      if (thisMonth >= 9 && thisMonth <= 12) {
        currentTerm = 'fall';
      } else if (thisMonth >= 1 && thisMonth <= 5) {
        currentTerm = 'spring';
      } else {
        currentTerm = 'summer';
      }
      this.selectedSemester =
        this.semesters.find(
          (s) => s.year === currentYear && s.term.toLowerCase() === currentTerm
        ) ?? this.semesters[0];
    }

    this.LoadClassScheduleData();

    // Load courses from studentDataStorageService
    const courses = this.studentDataStorageService.getCoursesInfo();
    if (courses && courses.length > 0) {
      this.availableClasses = courses;
      this.selectedClassId = courses[0]?.id || null;
    }
  }

  onSemesterChange() {
    if (this.selectedSemester) {
      console.log('Selected Semester:', this.selectedSemester);

      // Load class schedule, etc.
      this.LoadClassScheduleData();
      // Guard: clear classes and selection if no courses for this semester
      const courses = this.studentDataStorageService.getCoursesInfo();
      if (courses && courses.length > 0) {
        this.availableClasses = courses;
        this.selectedClassId = courses[0]?.id || null;
      } else {
        this.availableClasses = [];
        this.selectedClassId = null;
      }
      // Reset colors when switching semesters to ensure unique colors for new courses
      this.resetAllColors();
    }
  }

  private LoadClassScheduleData(): void {
    console.log('lets load some class schedule data');

    //clear the contents of course and weeklyCourseSchedule
    this.studentDataStorageService.setCoursesInfo([]);
    this.studentDataStorageService.setCourseWeeklyScheduleInfo([]);

    //load courses based on semester id
    if (this.selectedSemester) {
      this.dashboardService
        .getCourses(this.selectedSemester.id)
        .pipe(
          tap((responseData) => {
            console.log('Original courses from API:', responseData.body);

            const coursesFromApi = responseData.body ?? [];

            // Transform to the expected format
            const formattedCourses = coursesFromApi.map((course: any) => {
              return {
                id: course.id,
                semesterId: course.semester.id,
                courseName: course.courseName,
                professorName: course.professorName,
                room: course.room,
              };
            });

            console.log(
              'Formatted courses with numeric semesterId:',
              formattedCourses
            );

            // Store the transformed semesters
            this.studentDataStorageService.setCoursesInfo(formattedCourses);
            // Assign colors after courses are loaded
            this.assignColorsToCourses();
          }),
          switchMap((responseData) => {
            const courses = responseData.body ?? [];

            const courseScheduleRequests = courses.map((course) =>
              this.dashboardService.getCourseWeeklySchedule(course.id)
            );

            return forkJoin(courseScheduleRequests);
          }),
          tap((allResponses) => {
            const allSchedulesFromApi = allResponses.flatMap(
              (res: any) => res.body ?? []
            );

            console.log(
              'Original weekly course schedule from API:',
              allSchedulesFromApi
            );

            // Transform to the expected format
            const formattedSchedules = allSchedulesFromApi.map(
              (schedule: any) => {
                return {
                  id: schedule.id,
                  courseId: schedule.course.id,
                  dayOfWeek: schedule.dayOfWeek,
                  startTime: schedule.startTime,
                  endTime: schedule.endTime,
                };
              }
            );

            console.log(
              'Formatted weekly course schedule with numeric courseId:',
              formattedSchedules
            );

            // Store the transformed semesters
            this.studentDataStorageService.setCourseWeeklyScheduleInfo(
              formattedSchedules
            );
          })
        )
        .subscribe({
          next: () => {
            console.log(
              'Course data stored successfully in Student Data Storage service'
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

  private generateTimeSlots(): void {
    const startHour = 7;
    const endHour = 18; // up to 5:50 PM
    const interval = 10;

    const slots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += interval) {
        const hourStr = hour.toString().padStart(2, '0');
        const minStr = min.toString().padStart(2, '0');
        slots.push(`${hourStr}:${minStr}`);
      }
    }
    this.timeSlots = slots;
  }

  isClassInSlot(course: CourseWeeklySchedule, slot: string): boolean {
    return (
      course.startTime <= slot && course.endTime > slot // '>' means class is still ongoing
    );
  }

  getCourseWeeklyScheduleAtSlot(
    day: string,
    timeSlot: string
  ): CourseWeeklySchedule | null {
    const courseWeeklySchedule =
      this.studentDataStorageService.getCourseWeeklyScheduleInfo();

    const match = courseWeeklySchedule.find((schedule) => {
      if (schedule.dayOfWeek !== day) return false;

      // Normalize to "HH:mm" format
      const startTime = schedule.startTime?.substring(0, 5); // e.g., "09:10:00" → "09:10"
      const endTime = schedule.endTime?.substring(0, 5); // e.g., "10:40:00" → "10:40"

      return timeSlot >= startTime && timeSlot < endTime;
    });

    return match ?? null;
  }

  // let matchedCourseWeeklySchedule = courseWeeklySchedule.filter((course) => {
  //   console.log('dayofweek: ' + course.dayOfWeek.toLowerCase());
  //   console.log('day: ' + day.toLowerCase());
  //   console.log(course.dayOfWeek.toLowerCase() === day.toLowerCase());
  //   console.log(this.isClassInSlot(course, timeSlot));
  //   return (
  //     course.dayOfWeek.toLowerCase() === day.toLowerCase() &&
  //     this.isClassInSlot(course, timeSlot)
  //   );
  // });

  // return courseWeeklySchedule.filter(
  //   (course) =>
  //     course.dayOfWeek.toLowerCase() === day.toLowerCase() &&
  //     this.isClassInSlot(course, timeSlot)
  // );
  // }

  getCourseName(schedule: CourseWeeklySchedule): string {
    const availableCourses = this.studentDataStorageService.getCoursesInfo();

    const foundCourse = availableCourses.find(
      (c) => c.id === schedule.courseId
    );

    return foundCourse?.courseName ?? 'Unknown Course';
  }

  getPastelColorForCourse(courseName: string): string {
    // Simple hash function to get consistent colors for the same course
    let hash = 0;
    for (let i = 0; i < courseName.length; i++) {
      hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.pastelColors[Math.abs(hash) % this.pastelColors.length];
  }

  assignColorsToCourses() {
    const courses = this.studentDataStorageService.getCoursesInfo();

    // Clear used colors when reassigning to ensure fresh start
    this.usedColors.clear();

    courses.forEach((course) => {
      if (!this.courseColors[course.id]) {
        this.courseColors[course.id] = this.generateUniquePastelColor();
      } else {
        // If course already has a color, mark it as used
        this.usedColors.add(this.courseColors[course.id]);
      }
    });
  }

  getCourseColor(schedule: CourseWeeklySchedule): string {
    return this.courseColors[schedule.courseId] || '#f0f0f0';
  }

  isClassStartSlot(day: string, timeSlot: string): CourseWeeklySchedule | null {
    const courseWeeklySchedule =
      this.studentDataStorageService.getCourseWeeklyScheduleInfo();

    const match = courseWeeklySchedule.find((schedule) => {
      if (schedule.dayOfWeek !== day) return false;

      // Check if this is the start time of the class
      const startTime = schedule.startTime?.substring(0, 5);
      return timeSlot === startTime;
    });

    return match || null;
  }

  onClassAdded(newCourse: Course) {
    this.showAddClass = false;

    // Assign a unique color to the new course immediately
    if (newCourse.id && !this.courseColors[newCourse.id]) {
      this.courseColors[newCourse.id] = this.generateUniquePastelColor();
    }

    // Refresh the courses list
    this.LoadClassScheduleData();
  }

  onAddClassCancelled() {
    this.showAddClass = false;
  }

  onAddClassClick() {
    console.log('Add Class button clicked!');
    console.log('Current showAddClass value:', this.showAddClass);
    console.log('Selected semester:', this.selectedSemester);
    this.showAddClass = true;
    console.log('New showAddClass value:', this.showAddClass);
  }

  showDeleteDialog = false;
  deleteClassName = '';

  onDeleteClassClick() {
    const courses = this.studentDataStorageService.getCoursesInfo();
    if (courses && courses.length > 0) {
      this.availableClasses = courses;
    }

    this.showDeleteDialog = true;
  }

  onDeleteDialogConfirm(classId: number) {
    this.selectedClassId = classId;
    this.deleteCourse();
  }

  onDeleteDialogCancel() {
    this.showDeleteDialog = false;
  }

  deleteCourse() {
    if (!this.selectedClassId) return;
    // Call the new dashboardService method with only courseId
    this.dashboardService
      .deleteCourseAndSchedules(this.selectedClassId, [])
      .subscribe({
        next: () => {
          // Remove from availableClasses
          this.availableClasses = this.availableClasses.filter(
            (c) => c.id !== this.selectedClassId
          );
          this.selectedClassId =
            this.availableClasses.length > 0
              ? this.availableClasses[0].id
              : null;
          this.showDeleteDialog = false;
          // Optionally refresh schedule data
          this.LoadClassScheduleData();
        },
        error: (err) => {
          console.error('Failed to delete course and schedules:', err);
          // Optionally show an error message to the user
        },
      });
  }

  showUpdateDialog = false;
  updateClassData: any = null;

  onUpdateClassClick() {
    const courses = this.studentDataStorageService.getCoursesInfo();
    if (courses && courses.length > 0) {
      this.availableClasses = courses;
    }

    this.showUpdateDialog = true;
  }

  onUpdateDialogConfirm(updatedClass: any) {
    // For now, just close the dialog and optionally update local data
    this.showUpdateDialog = false;
    if (updatedClass) {
      // Optionally update the class in availableClasses here
      // (no backend call yet)
    }
  }

  onUpdateDialogCancel() {
    this.showUpdateDialog = false;
  }

  // Reset all colors (useful for debugging or when switching semesters)
  resetAllColors() {
    this.courseColors = {};
    this.usedColors.clear();
    this.assignColorsToCourses();
  }
}
