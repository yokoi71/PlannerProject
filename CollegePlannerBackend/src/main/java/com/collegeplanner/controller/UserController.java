package com.collegeplanner.controller;


import java.sql.Date;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.collegeplanner.model.Customer;
import com.collegeplanner.model.Authority;
import com.collegeplanner.repository.CustomerRepository;
import com.collegeplanner.repository.AuthorityRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@Slf4j
public class UserController {

	private final CustomerRepository customerRepository;
	private final AuthorityRepository authorityRepository;
	private final PasswordEncoder passwordEncoder;

	@PostMapping("/register")
	public ResponseEntity<String> registerUser(@RequestBody Customer customer) {
		try {
			log.info("Received registration request for email: {}", customer.getEmail());
			
			// Check if user with this email already exists
			Optional<Customer> existingCustomer = customerRepository.findByEmail(customer.getEmail());
			if (existingCustomer.isPresent()) {
				log.warn("Registration failed: Email already exists: {}", customer.getEmail());
				return ResponseEntity.status(HttpStatus.CONFLICT)
						.body("{\"error\":\"User with this email already exists\"}");
			}

			// Set default role if not provided
			if (customer.getRole() == null || customer.getRole().isEmpty()) {
				customer.setRole("ROLE_USER");
			}

			// Set creation date
			customer.setCreateDt(new Date(System.currentTimeMillis()));

			String hashPwd = passwordEncoder.encode(customer.getPwd());
			customer.setPwd(hashPwd);
			
			log.info("Attempting to save customer: {}", customer.getName());
			Customer savedCustomer = customerRepository.save(customer);

			if (savedCustomer.getId() > 0) {
				// Create authority record for the new user
				Authority authority = new Authority();
				authority.setName(customer.getRole());
				authority.setCustomer(savedCustomer);
				authorityRepository.save(authority);
				
				log.info("Registration successful for user: {}", savedCustomer.getName());
				return ResponseEntity.status(HttpStatus.CREATED)
						.body("{\"message\":\"Given user details are successfully registered\",\"customer\":{\"id\":" + savedCustomer.getId() + ",\"name\":\"" + savedCustomer.getName() + "\",\"email\":\"" + savedCustomer.getEmail() + "\",\"mobileNumber\":\"" + savedCustomer.getMobileNumber() + "\",\"role\":\"" + savedCustomer.getRole() + "\"}}");
			} else {
				log.error("Registration failed: Customer saved but ID is 0");
				return ResponseEntity.status(HttpStatus.BAD_REQUEST)
						.body("{\"error\":\"User registration failed\"}");
			}

		} catch (Exception ex) {
			log.error("Registration exception occurred: ", ex);
			log.error("Exception type: " + ex.getClass().getSimpleName());
			log.error("Exception message: " + ex.getMessage());
			if (ex.getCause() != null) {
				log.error("Root cause: " + ex.getCause().getMessage());
			}
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("{\"error\":\"An exception occurred: " + ex.getMessage() + "\"}");
		}
	}

	@RequestMapping("/user")
	public Customer getUserDetailsAfterLogin(Authentication authentication) {
		Optional<Customer> optionalCustomer = customerRepository.findByEmail(authentication.getName());
		return optionalCustomer.orElse(null);
	}
}
