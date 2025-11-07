package com.collegeplanner.repository;

import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.Cards;

@Repository
public interface CardsRepository extends CrudRepository<Cards, Long> {
	List<Cards> findByCustomerId(long customerId);
}
