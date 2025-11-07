package com.collegeplanner.model;


import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Accounts {

	@Column(name = "customer_id")
	private long customerId;

	@Id
	@Column(name="account_number")
	private long accountNumber;

	@Column(name = "account_type")
	private String accountType;

	@Column(name = "branch_address")
	private String branchAddress;

	@Column(name = "create_dt")
	private Date createDt;

}

/*
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
*/