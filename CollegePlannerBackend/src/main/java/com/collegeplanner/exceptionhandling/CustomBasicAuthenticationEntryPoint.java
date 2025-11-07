package com.collegeplanner.exceptionhandling;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CustomBasicAuthenticationEntryPoint implements AuthenticationEntryPoint {

	//The following method add both a custom header and a custom body.
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException, ServletException {

		//populate dynamic values for JSON response
		LocalDateTime currentTimeStamp = LocalDateTime.now();
		String message = (authException != null && authException.getMessage() != null) ? authException.getMessage()
				: "Unauthorized";
		String path = request.getRequestURI();

		response.setHeader("collegeplanner-error-reason", "Authentication failed");
		response.setStatus(HttpStatus.UNAUTHORIZED.value());
		response.setContentType("application/json;charset=UTF-8");

		// Construct the JSON response
		String jsonResponse = String.format(
				"{\"timestamp\": \"%s\", \"status\": %d, \"error\": \"%s\", \"message\": \"%s\", \"path\": \"%s\"}",
				currentTimeStamp, HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.getReasonPhrase(),
				message, path);
		response.getWriter().write(jsonResponse);

	}

	// The following method only add a custom header	
	//	@Override
	//	public void commence(HttpServletRequest request, HttpServletResponse response,
	//			AuthenticationException authException) throws IOException, ServletException {
	//		response.setHeader("eazybank-error-reason", "Authentication failed");
	//		response.sendError(HttpStatus.UNAUTHORIZED.value(), HttpStatus.UNAUTHORIZED.getReasonPhrase());
	//	}
	//	//Original codes from BasicAuthentiationEntryPoint
}
