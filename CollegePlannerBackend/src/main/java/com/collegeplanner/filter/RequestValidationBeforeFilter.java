package com.collegeplanner.filter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.util.StringUtils;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class RequestValidationBeforeFilter implements Filter {

	@Override
	public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
			throws IOException, ServletException {
		HttpServletRequest req = (HttpServletRequest) request;
		HttpServletResponse res = (HttpServletResponse) response;
		String header = req.getHeader(HttpHeaders.AUTHORIZATION);
		if (null != header) {
			header = header.trim();
			if (StringUtils.startsWithIgnoreCase(header, "Basic ")) {
				byte[] base64Token = header.substring(6).getBytes(StandardCharsets.UTF_8);
				//e.g. base64Token="[97, 71, 70, 119, 99, 72, 108, 65, 90, 88, 104, .....]"
				byte[] decoded;
				try {
					decoded = Base64.getDecoder().decode(base64Token);
					String token = new String(decoded, StandardCharsets.UTF_8);//un:pwd
					//e.g. token="happy@example.com:EazyBytes@54321"
					int delim = token.indexOf(":");
					if (delim == -1) {
						throw new BadCredentialsException("Invalid basic authentication token");
					}
					String email = token.substring(0, delim);
					if (email.toLowerCase().contains("test")) {
						res.setStatus(HttpServletResponse.SC_BAD_REQUEST);
						return;
					}
				} catch (IllegalArgumentException exception) {
					throw new BadCredentialsException("Failed to decode basic authentication token");
				}
			}
		}
		chain.doFilter(request, response);
	}

}
