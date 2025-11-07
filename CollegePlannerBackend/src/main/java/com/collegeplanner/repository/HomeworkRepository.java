package com.collegeplanner.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.Homework;

@Repository
public interface HomeworkRepository extends CrudRepository<Homework, Long> {
	List<Homework> findHomeworkByCourseId(long courseId);

	List<Homework> findByCourseId(long id);
}
