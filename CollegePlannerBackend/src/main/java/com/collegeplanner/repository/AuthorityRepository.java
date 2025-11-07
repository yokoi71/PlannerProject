package com.collegeplanner.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.Authority;

@Repository
public interface AuthorityRepository extends CrudRepository<Authority, Integer> {
} 