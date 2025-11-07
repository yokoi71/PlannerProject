package com.collegeplanner.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.Exam;

@Repository
public interface ExamRepository extends CrudRepository<Exam, Long> {

	List<Exam> findByCourseId(long courseId);
}
