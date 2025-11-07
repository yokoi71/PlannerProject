package com.collegeplanner.controller;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class WelcomeController {

	@GetMapping("/welcome")
	public String sayWelcome() {
		return "Welcome to Spring Application with Security";
	}

	@GetMapping("/csrf-token")
	public String getCsrfToken(HttpServletRequest request) {
		CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
		if (csrfToken != null) {
			return csrfToken.getToken();
		}
		return "No CSRF token available";
	}
}