package com.collegeplanner.filter;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class CsrfCookieFilter extends OncePerRequestFilter {

	private static final Logger logger = LoggerFactory.getLogger(CsrfCookieFilter.class);

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		logger.info("CsrfCookieFilter invoked for method: {} path: {}", request.getMethod(), request.getRequestURI());
		CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
		
		if (csrfToken != null) {
			// Create a cookie with the CSRF token
			Cookie cookie = new Cookie("XSRF-TOKEN", csrfToken.getToken());
			cookie.setPath("/");
			cookie.setHttpOnly(false); // Allow JavaScript access
			cookie.setSecure(false); // Set to true in production with HTTPS
			cookie.setMaxAge(-1); // Session cookie
			
			// For cross-origin requests, we need to set SameSite=None
			// But this requires Secure=true, so we'll use Lax for now
			response.addCookie(cookie);
		}
		
		filterChain.doFilter(request, response);
	}
}
