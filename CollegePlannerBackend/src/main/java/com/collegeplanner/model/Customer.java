package com.collegeplanner.model;

import java.sql.Date;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Customer {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "customer_id")
	private long id;

	private String name;

	private String email;

	@Column(name = "mobile_number")
	private String mobileNumber;

	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	private String pwd;

	private String role;

	@Column(name = "create_dt")
	@JsonIgnore
	private Date createDt;

	@OneToMany(mappedBy = "customer", fetch = FetchType.EAGER)
	@JsonIgnore
	private Set<Authority> authorities;

}

/*
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
*/