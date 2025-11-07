package com.collegeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.collegeplanner.model.Loans;
import com.collegeplanner.repository.LoanRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class LoansController {

	private final LoanRepository loanRepository;

	@GetMapping("/myLoans")
	public List<Loans> getLoanDetails(@RequestParam long id) {
		List<Loans> loans = loanRepository.findByCustomerIdOrderByStartDtDesc(id);
		if (loans != null) {
			return loans;
		} else {
			return null;
		}
	}

}