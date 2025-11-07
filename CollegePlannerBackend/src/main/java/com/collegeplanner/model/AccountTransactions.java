package com.collegeplanner.model;

import java.sql.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "account_transactions")
public class AccountTransactions {

	@Id
	@Column(name = "transaction_id")
	private String transactionId;

	@Column(name = "account_number")
	private long accountNumber;

	@Column(name = "customer_id")
	private long customerId;

	@Column(name = "transaction_dt")
	private Date transactionDt;

	@Column(name = "transaction_summary")
	private String transactionSummary;

	@Column(name = "transaction_type")
	private String transactionType;

	@Column(name = "transaction_amt")
	private int transactionAmt;

	@Column(name = "closing_balance")
	private int closingBalance;

	@Column(name = "create_dt")
	private Date createDt;

}

/*
CREATE TABLE `account_transactions` (
`transaction_id` varchar(200) NOT NULL,
`account_number` int NOT NULL,
`customer_id` int NOT NULL,
`transaction_dt` date NOT NULL,
`transaction_summary` varchar(200) NOT NULL,
`transaction_type` varchar(100) NOT NULL,
`transaction_amt` int NOT NULL,
`closing_balance` int NOT NULL,
`create_dt` date DEFAULT NULL,
PRIMARY KEY (`transaction_id`),
KEY `customer_id` (`customer_id`),
KEY `account_number` (`account_number`),
CONSTRAINT `accounts_ibfk_2` FOREIGN KEY (`account_number`) REFERENCES `accounts` (`account_number`) ON DELETE CASCADE,
CONSTRAINT `acct_user_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customer` (`customer_id`) ON DELETE CASCADE
);
*/