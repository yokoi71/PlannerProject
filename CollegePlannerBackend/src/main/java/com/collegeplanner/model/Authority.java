package com.collegeplanner.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "authorities")
public class Authority {

	@jakarta.persistence.Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int id;

	@Column(name = "name")
	private String name;

	@ManyToOne
	@JoinColumn(name = "customer_id")
	private Customer customer;

}

//CREATE TABLE `authorities` (
//		  `id` int NOT NULL AUTO_INCREMENT,
//		  `customer_id` int NOT NULL,
//		  `name` varchar(50) NOT NULL,
//		  PRIMARY KEY (`id`),
//		  KEY `customer_id` (`customer_id`),
//		  CONSTRAINT `authorities_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`)
//		);