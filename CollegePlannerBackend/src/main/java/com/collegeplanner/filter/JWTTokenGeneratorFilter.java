package com.collegeplanner.filter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;

import org.springframework.core.env.Environment;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import com.collegeplanner.constants.ApplicationConstants;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JWTTokenGeneratorFilter extends OncePerRequestFilter {

	private final Environment environment;

	public JWTTokenGeneratorFilter(Environment environment) {
		this.environment = environment;
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
			throws ServletException, IOException {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if(null!=authentication) {
			if(null!=environment) {
				String secret = environment.getProperty(ApplicationConstants.JWT_SECRET_KEY);
				if (secret == null || secret.trim().isEmpty()) {
					throw new IllegalStateException("JWT_SECRET environment variable is required but not set. Please configure JWT_SECRET in your environment or application properties.");
				}
				SecretKey secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
				String jwt = Jwts.builder().issuer("College Planner").subject("JWT Token")
						.claim("username", authentication.getName())
						.claim("authorities", authentication.getAuthorities().stream()
								.map(GrantedAuthority::getAuthority).collect(Collectors.joining(",")))
						.issuedAt(new Date())
						.expiration(new Date((new Date()).getTime() + 30000000))
						.signWith(secretKey).compact();

				response.setHeader(ApplicationConstants.JWT_HEADER, jwt);
			}
		}
		filterChain.doFilter(request, response);
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
		return !request.getServletPath().equals("/user");
	}

}