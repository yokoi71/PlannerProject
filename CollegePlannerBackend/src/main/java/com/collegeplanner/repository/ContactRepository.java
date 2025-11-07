package com.collegeplanner.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.Contact;

@Repository
public interface ContactRepository extends CrudRepository<Contact, String> {

}
