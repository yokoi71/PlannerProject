
-- DATABASE: college_planner
CREATE DATABASE IF NOT EXISTS college_planner;
USE college_planner;

-- Table: students
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

-- Table: semesters
CREATE TABLE semesters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    year YEAR NOT NULL,
    term ENUM('Spring', 'Summer', 'Fall', 'Winter') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Table: course
CREATE TABLE course (
    id INT PRIMARY KEY AUTO_INCREMENT,
    semester_id INT NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    professor_name VARCHAR(100),
    room VARCHAR(50),
    FOREIGN KEY (semester_id) REFERENCES semesters(id)
);

-- More flexible schedule table
CREATE TABLE course_weekly_schedule (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (course_id) REFERENCES course(id)
);

-- Table: homework
CREATE TABLE homework (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    status ENUM('Pending', 'Completed') DEFAULT 'Pending',
    reminder_days_before INT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES course(id)
);

-- Table: exams
CREATE TABLE exams (
    id INT PRIMARY KEY AUTO_INCREMENT,
    course_id INT NOT NULL,
    exam_type ENUM('Midterm', 'Final', 'Quiz', 'Other') DEFAULT 'Other',
    exam_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(100),
    reminder_days_before INT DEFAULT 0,
    FOREIGN KEY (course_id) REFERENCES course(id)
);

-- Table: reminders
CREATE TABLE reminders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    reminder_date DATE NOT NULL,
    reminder_time TIME,
    recurring ENUM('None', 'Daily', 'Weekly') DEFAULT 'None',
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Table: events
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(100),
    notes TEXT,
    reminder_days_before INT DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Seed data
INSERT INTO students (name, email)
VALUES ('Alice Tanaka', 'alice.tanaka@example.com');

-- Semester: Spring 2025
INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (1, 2025, 'Spring', '2025-01-10', '2025-05-31');

-- Courses in Spring 2025
INSERT INTO course (semester_id, course_name, professor_name, room)
VALUES
(1, 'Introduction to Psychology', 'Dr. Smith', 'Room 201'),
(1, 'Calculus I', 'Prof. Jones', 'Room 105'),
(1, 'Computer Science 101', 'Dr. Kim', 'Room 301');

-- Weekly schedule with custom times per day
INSERT INTO course_weekly_schedule (course_id, day_of_week, start_time, end_time)
VALUES
(1, 'Monday', '10:00:00', '11:00:00'),
(1, 'Wednesday', '11:00:00', '12:00:00'),
(2, 'Tuesday', '09:00:00', '10:15:00'),
(2, 'Thursday', '09:30:00', '10:45:00'),
(3, 'Monday', '13:00:00', '14:00:00'),
(3, 'Wednesday', '13:30:00', '14:30:00'),
(3, 'Friday', '14:00:00', '15:00:00');

-- Homework assignments
INSERT INTO homework (course_id, title, description, due_date)
VALUES
(1, 'Read Chapter 3', 'Cover pages 45–66 of textbook', '2025-05-20'),
(2, 'Problem Set 2', 'Questions 1-10 from Section 2.2', '2025-05-22'),
(3, 'Lab 1: Basic Java', 'Submit code + write-up', '2025-05-25');

-- Exams
INSERT INTO exams (course_id, exam_type, exam_date, start_time, end_time, location)
VALUES
(1, 'Midterm', '2025-06-10', '10:00:00', '11:30:00', 'Room 201'),
(3, 'Quiz', '2025-06-05', '13:00:00', '13:30:00', 'Room 301');

-- Reminders
INSERT INTO reminders (student_id, title, description, reminder_date, reminder_time, recurring)
VALUES
(1, 'Wake Up', 'Start morning routine', '2025-05-13', '07:00:00', 'Daily'),
(1, 'Tuition Payment', 'Last day to pay tuition fee', '2025-06-01', '12:00:00', 'None');

-- Events
INSERT INTO events (student_id, title, event_date, start_time, end_time, location, notes)
VALUES
(1, 'Club Meeting', '2025-05-15', '17:00:00', '18:30:00', 'Student Center', 'Bring membership form'),
(1, 'Dentist Appointment', '2025-05-20', '15:00:00', '15:30:00', 'Downtown Clinic', NULL);
