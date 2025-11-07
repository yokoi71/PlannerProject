package com.collegeplanner.configuration;

import static org.springframework.security.config.Customizer.*;

import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.password.CompromisedPasswordChecker;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.password.HaveIBeenPwnedRestApiPasswordChecker;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import com.collegeplanner.exceptionhandling.CustomAccessDeniedHandler;
import com.collegeplanner.exceptionhandling.CustomBasicAuthenticationEntryPoint;
import com.collegeplanner.filter.CsrfCookieFilter;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
@Profile("prod")
public class ProjectSecurityProdConfig {

	@Bean
	SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {

		CsrfTokenRequestAttributeHandler csrfTokenRequestAttributeHandler = new CsrfTokenRequestAttributeHandler();

		http.securityContext(contextConfig -> contextConfig.requireExplicitSave(false))
				.sessionManagement(sessionConfig -> sessionConfig.sessionCreationPolicy(SessionCreationPolicy.ALWAYS))
				.cors(corsConfig -> corsConfig.configurationSource(new CorsConfigurationSource() {
			@Override
			public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
				CorsConfiguration config = new CorsConfiguration();
				config.setAllowedOrigins(Collections.singletonList("http://localhost:4200"));
				config.setAllowedMethods(Collections.singletonList("*"));
				config.setAllowCredentials(true);
				config.setAllowedHeaders(Collections.singletonList("*"));
				config.setMaxAge(3600L);
				return config;
			}
		}))
				.csrf(csrfConfig -> csrfConfig.csrfTokenRequestHandler(csrfTokenRequestAttributeHandler)
						.ignoringRequestMatchers("/contact", "/register")
						//						, "/updateStudentInfo", "/addCourse",
						//								"/addCourseWeeklySchedule")
						.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
				.addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
				.requiresChannel(rcc -> rcc.anyRequest().requiresSecure()) // Only HTTPS
				.authorizeHttpRequests((requests) -> requests
						.requestMatchers("/myAccount", "/myBalance", "/myLoans", "/myCards", "/user", "/myStudentInfo",
								"/mySemesters", "/myCourses", "/myReminders", "/myEvents", "/myHolidays", "/myHolidays/**", "/myCourseWeeklySchedule",
								"/myHomework", "/myExams", "/updateStudentInfo", "/addCourse",
								"/addCourseWeeklySchedule", "/deleteCourse",
								"/deleteCourseWeeklySchedule")
						.authenticated()
						.requestMatchers("/notices", "/contact", "/error", "/register", "/invalidSession").permitAll());
		http.formLogin(withDefaults());
		http.httpBasic(hbc -> hbc.authenticationEntryPoint(new CustomBasicAuthenticationEntryPoint()));
		//Only used during httpBasic flow. hbc = HttpBasicConfigurer

		//http.exceptionHandling(ehc -> ehc.authenticationEntryPoint(new CustomBasicAuthenticationEntryPoint()));
		//global configuration for authentication exception happened anywhere.  ehc=ExceptionHandlingConfigurer

		http.exceptionHandling(ehc -> ehc.accessDeniedHandler(new CustomAccessDeniedHandler()));
		//you can invoke a page on a browser instead
		//		http.exceptionHandling(ehc -> ehc.accessDeniedHandler(new CustomAccessDeniedHandler())
		//				.accessDeniedPage("/denied"));

		return http.build();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
	}

	/**
	 * From Spring Security 6.3 version
	 * @return
	 */
	@Bean
	public CompromisedPasswordChecker compromisedPasswordChecker() {
		return new HaveIBeenPwnedRestApiPasswordChecker();
	}

}