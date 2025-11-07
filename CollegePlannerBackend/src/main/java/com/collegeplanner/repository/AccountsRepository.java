package com.collegeplanner.repository;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.collegeplanner.model.Accounts;

@Repository
public interface AccountsRepository extends CrudRepository<Accounts, Long> {

	Accounts findByCustomerId(long customerId);

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