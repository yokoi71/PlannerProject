package com.collegeplanner.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.CourseWeeklySchedule;

@Repository
public interface CourseWeeklyScheduleRepository extends CrudRepository<CourseWeeklySchedule, Long> {
	List<CourseWeeklySchedule> findByCourseId(long courseId);
	void deleteByCourseId(long courseId);
}
/*
CREATE TABLE course_weekly_schedule (
id INT PRIMARY KEY AUTO_INCREMENT,
course_id INT NOT NULL,
day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
start_time TIME NOT NULL,
end_time TIME NOT NULL,
FOREIGN KEY (course_id) REFERENCES course(id)
);
*/