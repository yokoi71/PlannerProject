
-- DATABASE: college_planner
CREATE DATABASE IF NOT EXISTS college_planner;
USE college_planner;
SHOW tables;
-- Table: students
CREATE TABLE students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    school_name VARCHAR(150) NOT NULL,
    grade ENUM('Freshman', 'Sophomore', 'Junior', 'Senior') NOT NULL
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
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(100),
    notes TEXT,
    reminder_days_before INT DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE holidays (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Seed data

INSERT INTO students (name, email, date_of_birth, gender, grade, school_name)
VALUES (
  'Hana Tanaka',
  'Hana.tanaka@example.com',
  '2004-05-12',
  'Female',
  'Freshman',
  'Earth University'
);


-- Semester: Spring 2025
INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (1, 2025, 'Spring', '2025-01-10', '2025-05-31');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (1, 2025, 'Summer', '2025-06-20', '2025-08-31');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (1, 2025, 'Fall', '2025-09-10', '2025-12-15');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (1, 2026, 'Spring', '2025-01-10', '2025-05-31');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (1, 2026, 'Summer', '2025-06-20', '2025-08-31');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (1, 2026, 'Fall', '2025-09-10', '2025-12-15');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (2, 2025, 'Spring', '2025-01-10', '2025-05-31');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (2, 2025, 'Summer', '2025-06-20', '2025-08-31');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (2, 2025, 'Fall', '2025-09-10', '2025-12-15');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (2, 2026, 'Spring', '2025-01-10', '2025-05-31');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (2, 2026, 'Summer', '2025-06-20', '2025-08-31');

INSERT INTO semesters (student_id, year, term, start_date, end_date)
VALUES (2, 2026, 'Fall', '2025-09-10', '2025-12-15');


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



-- Below are for eazybank. Delete later.



drop table `authorities`;
drop table `users`;
drop table `customer`;

CREATE TABLE `customer` (
  `customer_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile_number` varchar(20) NOT NULL,
  `pwd` varchar(500) NOT NULL,
  `role` varchar(100) NOT NULL,
  `create_dt` date DEFAULT NULL,
  PRIMARY KEY (`customer_id`)
);

INSERT INTO `customer` (`name`,`email`,`mobile_number`, `pwd`, `role`,`create_dt`)
 VALUES ('Happy','happy@example.com','5334122365', '{bcrypt}$2a$12$88.f6upbBvy0okEa7OfHFuorV29qeK.sVbB9VQ6J6dWM1bW6Qef8m', 'admin',CURDATE());

CREATE TABLE `accounts` (
  `customer_id` int NOT NULL,
   `account_number` int NOT NULL,
  `account_type` varchar(100) NOT NULL,
  `branch_address` varchar(200) NOT NULL,
  `create_dt` date DEFAULT NULL,
  PRIMARY KEY (`account_number`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `customer_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE
);

INSERT INTO `accounts` (`customer_id`, `account_number`, `account_type`, `branch_address`, `create_dt`)
 VALUES (1, 1865764534, 'Savings', '123 Main Street, New York', CURDATE());

CREATE TABLE `account_transactions` (
  `transaction_id` varchar(200) NOT NULL,
  `account_number` int NOT NULL,
  `customer_id` int NOT NULL,
  `transaction_dt` date NOT NULL,
  `transaction_summary` varchar(200) NOT NULL,
  `transaction_type` varchar(100) NOT NULL,
  `transaction_amt` int NOT NULL,
  `closing_balance` int NOT NULL,
  `create_dt` date DEFAULT NULL,
  PRIMARY KEY (`transaction_id`),
  KEY `customer_id` (`customer_id`),
  KEY `account_number` (`account_number`),
  CONSTRAINT `accounts_ibfk_2` FOREIGN KEY (`account_number`) REFERENCES `accounts` (`account_number`) ON DELETE CASCADE,
  CONSTRAINT `acct_user_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE
);



INSERT INTO `account_transactions` (`transaction_id`, `account_number`, `customer_id`, `transaction_dt`, `transaction_summary`, `transaction_type`,`transaction_amt`,
`closing_balance`, `create_dt`)  VALUES (UUID(), 1865764534, 1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'Coffee Shop', 'Withdrawal', 30,34500,DATE_SUB(CURDATE(), INTERVAL 7 DAY));

INSERT INTO `account_transactions` (`transaction_id`, `account_number`, `customer_id`, `transaction_dt`, `transaction_summary`, `transaction_type`,`transaction_amt`,
`closing_balance`, `create_dt`)  VALUES (UUID(), 1865764534, 1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'Uber', 'Withdrawal', 100,34400,DATE_SUB(CURDATE(), INTERVAL 6 DAY));

INSERT INTO `account_transactions` (`transaction_id`, `account_number`, `customer_id`, `transaction_dt`, `transaction_summary`, `transaction_type`,`transaction_amt`,
`closing_balance`, `create_dt`)  VALUES (UUID(), 1865764534, 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Self Deposit', 'Deposit', 500,34900,DATE_SUB(CURDATE(), INTERVAL 5 DAY));

INSERT INTO `account_transactions` (`transaction_id`, `account_number`, `customer_id`, `transaction_dt`, `transaction_summary`, `transaction_type`,`transaction_amt`,
`closing_balance`, `create_dt`)  VALUES (UUID(), 1865764534, 1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'Ebay', 'Withdrawal', 600,34300,DATE_SUB(CURDATE(), INTERVAL 4 DAY));

INSERT INTO `account_transactions` (`transaction_id`, `account_number`, `customer_id`, `transaction_dt`, `transaction_summary`, `transaction_type`,`transaction_amt`,
`closing_balance`, `create_dt`)  VALUES (UUID(), 1865764534, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'OnlineTransfer', 'Deposit', 700,35000,DATE_SUB(CURDATE(), INTERVAL 2 DAY));

INSERT INTO `account_transactions` (`transaction_id`, `account_number`, `customer_id`, `transaction_dt`, `transaction_summary`, `transaction_type`,`transaction_amt`,
`closing_balance`, `create_dt`)  VALUES (UUID(), 1865764534, 1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Amazon.com', 'Withdrawal', 100,34900,DATE_SUB(CURDATE(), INTERVAL 1 DAY));


CREATE TABLE `loans` (
  `loan_number` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `start_dt` date NOT NULL,
  `loan_type` varchar(100) NOT NULL,
  `total_loan` int NOT NULL,
  `amount_paid` int NOT NULL,
  `outstanding_amount` int NOT NULL,
  `create_dt` date DEFAULT NULL,
  PRIMARY KEY (`loan_number`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `loan_customer_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE
);

INSERT INTO `loans` ( `customer_id`, `start_dt`, `loan_type`, `total_loan`, `amount_paid`, `outstanding_amount`, `create_dt`)
 VALUES ( 1, '2020-10-13', 'Home', 200000, 50000, 150000, '2020-10-13');

INSERT INTO `loans` ( `customer_id`, `start_dt`, `loan_type`, `total_loan`, `amount_paid`, `outstanding_amount`, `create_dt`)
 VALUES ( 1, '2020-06-06', 'Vehicle', 40000, 10000, 30000, '2020-06-06');

INSERT INTO `loans` ( `customer_id`, `start_dt`, `loan_type`, `total_loan`, `amount_paid`, `outstanding_amount`, `create_dt`)
 VALUES ( 1, '2018-02-14', 'Home', 50000, 10000, 40000, '2018-02-14');

INSERT INTO `loans` ( `customer_id`, `start_dt`, `loan_type`, `total_loan`, `amount_paid`, `outstanding_amount`, `create_dt`)
 VALUES ( 1, '2018-02-14', 'Personal', 10000, 3500, 6500, '2018-02-14');

CREATE TABLE `cards` (
  `card_id` int NOT NULL AUTO_INCREMENT,
  `card_number` varchar(100) NOT NULL,
  `customer_id` int NOT NULL,
  `card_type` varchar(100) NOT NULL,
  `total_limit` int NOT NULL,
  `amount_used` int NOT NULL,
  `available_amount` int NOT NULL,
  `create_dt` date DEFAULT NULL,
  PRIMARY KEY (`card_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `card_customer_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE
);

INSERT INTO `cards` (`card_number`, `customer_id`, `card_type`, `total_limit`, `amount_used`, `available_amount`, `create_dt`)
 VALUES ('4565XXXX4656', 1, 'Credit', 10000, 500, 9500, CURDATE());

INSERT INTO `cards` (`card_number`, `customer_id`, `card_type`, `total_limit`, `amount_used`, `available_amount`, `create_dt`)
 VALUES ('3455XXXX8673', 1, 'Credit', 7500, 600, 6900, CURDATE());

INSERT INTO `cards` (`card_number`, `customer_id`, `card_type`, `total_limit`, `amount_used`, `available_amount`, `create_dt`)
 VALUES ('2359XXXX9346', 1, 'Credit', 20000, 4000, 16000, CURDATE());

CREATE TABLE `notice_details` (
  `notice_id` int NOT NULL AUTO_INCREMENT,
  `notice_summary` varchar(200) NOT NULL,
  `notice_details` varchar(500) NOT NULL,
  `notic_beg_dt` date NOT NULL,
  `notic_end_dt` date DEFAULT NULL,
  `create_dt` date DEFAULT NULL,
  `update_dt` date DEFAULT NULL,
  PRIMARY KEY (`notice_id`)
);

INSERT INTO `notice_details` ( `notice_summary`, `notice_details`, `notic_beg_dt`, `notic_end_dt`, `create_dt`, `update_dt`)
VALUES ('Home Loan Interest rates reduced', 'Home loan interest rates are reduced as per the goverment guidelines. The updated rates will be effective immediately',
CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL 30 DAY, CURDATE(), null);

INSERT INTO `notice_details` ( `notice_summary`, `notice_details`, `notic_beg_dt`, `notic_end_dt`, `create_dt`, `update_dt`)
VALUES ('Net Banking Offers', 'Customers who will opt for Internet banking while opening a saving account will get a $50 amazon voucher',
CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL 30 DAY, CURDATE(), null);

INSERT INTO `notice_details` ( `notice_summary`, `notice_details`, `notic_beg_dt`, `notic_end_dt`, `create_dt`, `update_dt`)
VALUES ('Mobile App Downtime', 'The mobile application of the EazyBank will be down from 2AM-5AM on 12/05/2020 due to maintenance activities',
CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL 30 DAY, CURDATE(), null);

INSERT INTO `notice_details` ( `notice_summary`, `notice_details`, `notic_beg_dt`, `notic_end_dt`, `create_dt`, `update_dt`)
VALUES ('E Auction notice', 'There will be a e-auction on 12/08/2020 on the Bank website for all the stubborn arrears.Interested parties can participate in the e-auction',
CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL 30 DAY, CURDATE(), null);

INSERT INTO `notice_details` ( `notice_summary`, `notice_details`, `notic_beg_dt`, `notic_end_dt`, `create_dt`, `update_dt`)
VALUES ('Launch of Millennia Cards', 'Millennia Credit Cards are launched for the premium customers of EazyBank. With these cards, you will get 5% cashback for each purchase',
CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL 30 DAY, CURDATE(), null);

INSERT INTO `notice_details` ( `notice_summary`, `notice_details`, `notic_beg_dt`, `notic_end_dt`, `create_dt`, `update_dt`)
VALUES ('COVID-19 Insurance', 'EazyBank launched an insurance policy which will cover COVID-19 expenses. Please reach out to the branch for more details',
CURDATE() - INTERVAL 30 DAY, CURDATE() + INTERVAL 30 DAY, CURDATE(), null);

CREATE TABLE `contact_messages` (
  `contact_id` varchar(50) NOT NULL,
  `contact_name` varchar(50) NOT NULL,
  `contact_email` varchar(100) NOT NULL,
  `subject` varchar(500) NOT NULL,
  `message` varchar(2000) NOT NULL,
  `create_dt` date DEFAULT NULL,
  PRIMARY KEY (`contact_id`)
);


CREATE TABLE `authorities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `authorities_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`)
);

INSERT INTO `authorities` (`customer_id`, `name`)
 VALUES (1, 'VIEWACCOUNT');

INSERT INTO `authorities` (`customer_id`, `name`)
 VALUES (1, 'VIEWCARDS');

 INSERT INTO `authorities` (`customer_id`, `name`)
  VALUES (1, 'VIEWLOANS');

 INSERT INTO `authorities` (`customer_id`, `name`)
   VALUES (1, 'VIEWBALANCE');

-- Execute the followings to use roles instead of authorities. check the defaultSecurityFilterChain method.

DELETE FROM `authorities`;

 INSERT INTO `authorities` (`customer_id`, `name`)
  VALUES (1, 'ROLE_USER');

 INSERT INTO `authorities` (`customer_id`, `name`)
  VALUES (1, 'ROLE_ADMIN');
  
  
  -- Summer Break
INSERT INTO holidays (student_id, title, year, start_date, end_date)
VALUES (1, 'Summer Break', 2025, '2025-08-01', '2025-08-31');

-- Fall Recess
INSERT INTO holidays (student_id, title, year, start_date, end_date)
VALUES (1, 'Fall Recess', 2025, '2025-10-10', '2025-10-14');

-- Winter Break
INSERT INTO holidays (student_id, title, year, start_date, end_date)
VALUES (1, 'Winter Break', 2025, '2025-12-20', '2026-01-05');

-- Spring Break
INSERT INTO holidays (student_id, title, year, start_date, end_date)
VALUES (1, 'Spring Break', 2026, '2026-03-15', '2026-03-22');

-- Golden Week (if in Japan)
INSERT INTO holidays (student_id, title, year, start_date, end_date)
VALUES (1, 'Golden Week', 2026, '2026-04-29', '2026-05-05');

INSERT INTO events (student_id, title, start_date, end_date, start_time, end_time, location, notes, reminder_days_before) VALUES
(1, 'Math Club Meeting', CURDATE(), CURDATE(), '15:00:00', '16:30:00', 'Room 202', 'Bring notes on algebra.', 1),
(1, 'Group Project Kickoff', DATE_ADD(CURDATE(), INTERVAL 3 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), '10:00:00', '12:00:00', 'Library Study Room A', 'Meet with assigned group', 2),
(1, 'Career Workshop', DATE_ADD(CURDATE(), INTERVAL 7 DAY), DATE_ADD(CURDATE(), INTERVAL 7 DAY), '14:00:00', '17:00:00', 'Auditorium', 'Dress formal.', 3);

-- Reminder to start math competition
INSERT INTO reminders (student_id, title, description, reminder_date, reminder_time, recurring)
VALUES (
  1,
  'Start Math competition',
  'Begin the assigned problems from Chapter 4.',
  '2025-08-20',
  '18:00:00',
  'None'
);

-- Weekly review session reminder
INSERT INTO reminders (student_id, title, description, reminder_date, reminder_time, recurring)
VALUES (
  1,
  'Weekly Review Session',
  'Review class notes and organize materials for the week.',
  '2025-09-21',
  '20:00:00',
  'Weekly'
);

-- Daily medication reminder
INSERT INTO reminders (student_id, title, description, reminder_date, reminder_time, recurring)
VALUES (
  1,
  'Take Medication',
  'Daily medication before breakfast.',
  '2025-10-16',
  '07:30:00',
  'Daily'
);

-- Reminder to prepare for biology Club meeting
INSERT INTO reminders (student_id, title, description, reminder_date, reminder_time, recurring)
VALUES (
  1,
  'Prepare for Biology Club meeting',
  'Read chapters 1–5 and review flashcards.',
  '2025-12-25',
  '19:00:00',
  'None'
);

-- Reminder to attend Rome Empire Research Conference
INSERT INTO reminders (student_id, title, description, reminder_date, reminder_time, recurring)
VALUES (
  1,
  'Attend Rome Empire Research Conference',
  'Upload to the conference portal before 11:59 PM.',
  '2026-03-30',
  '21:00:00',
  'None'
);