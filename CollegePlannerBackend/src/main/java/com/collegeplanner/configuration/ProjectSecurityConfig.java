package com.collegeplanner.configuration;

import static org.springframework.security.config.Customizer.*;

import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
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

import com.collegeplanner.constants.ApplicationConstants;
import com.collegeplanner.exceptionhandling.CustomAccessDeniedHandler;
import com.collegeplanner.exceptionhandling.CustomBasicAuthenticationEntryPoint;
import com.collegeplanner.filter.AuthoritiesLogginAfterFilter;
import com.collegeplanner.filter.AuthoritiesLoggingAtFilter;
import com.collegeplanner.filter.CsrfCookieFilter;
import com.collegeplanner.filter.JWTTokenGeneratorFilter;
import com.collegeplanner.filter.JWTTokenValidatorFilter;
import com.collegeplanner.filter.RequestValidationBeforeFilter;

import io.jsonwebtoken.lang.Arrays;
import jakarta.servlet.http.HttpServletRequest;

@Configuration
@Profile("!prod")
public class ProjectSecurityConfig {

	@Bean
	SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http, Environment environment) throws Exception {

		CsrfTokenRequestAttributeHandler csrfTokenRequestAttributeHandler = new CsrfTokenRequestAttributeHandler();
		//String[] auth = { "Authorization" };
		String[] auth2 = { ApplicationConstants.JWT_HEADER };

		http.sessionManagement(sessionConfig -> sessionConfig.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.cors(corsConfig -> corsConfig.configurationSource(new CorsConfigurationSource() {
			@Override
			public CorsConfiguration getCorsConfiguration(HttpServletRequest request) {
				CorsConfiguration config = new CorsConfiguration();
				config.setAllowedOrigins(Collections.singletonList("http://localhost:4200"));
				config.setAllowedMethods(Collections.singletonList("*"));
				config.setAllowCredentials(true);
				config.setAllowedHeaders(Collections.singletonList("*"));
						config.setExposedHeaders(Arrays.asList(auth2));
						//	config.setExposedHeaders(Arrays.asList(auth));
				config.setMaxAge(3600L);
				return config;
			}
		}))
				.csrf(csrfConfig -> csrfConfig.csrfTokenRequestHandler(csrfTokenRequestAttributeHandler)
						.ignoringRequestMatchers(
								"/contact", "/register", "/updateStudentInfo", "/addCourse",
								"/addCourseWeeklySchedule", "/deleteCourse/**",
								"/deleteCourseWeeklySchedule/**", "/mySemesters",
								"/myHolidays", "/myHolidays/**",
								"/myEvents", "/myEvents/**",
								"/myReminders", "/myReminders/**",
								"/myHomework", "/myHomework/**",
								"/myExams", "/myExams/**")
						.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
				.addFilterAfter(new CsrfCookieFilter(), BasicAuthenticationFilter.class)
				.addFilterBefore(new RequestValidationBeforeFilter(), BasicAuthenticationFilter.class)
				.addFilterAfter(new AuthoritiesLogginAfterFilter(), BasicAuthenticationFilter.class)
				.addFilterAt(new AuthoritiesLoggingAtFilter(), BasicAuthenticationFilter.class)
				.addFilterAfter(new JWTTokenGeneratorFilter(environment), BasicAuthenticationFilter.class)
				.addFilterBefore(new JWTTokenValidatorFilter(environment), BasicAuthenticationFilter.class)
				.requiresChannel(rcc -> rcc.anyRequest().requiresInsecure())
				.authorizeHttpRequests((requests) -> requests
						//						.requestMatchers("/myAccount").hasAuthority("VIEWACCOUNT")
						//						.requestMatchers("/myBalance").hasAnyAuthority("VIEWBALANCE", "VIEWACCOUNT")
						//						.requestMatchers("/myLoans").hasAuthority("VIEWLOANS")
						//						.requestMatchers("/myCards").hasAuthority("VIEWCARDS")
						//.requestMatchers("/myStudentInfo").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/myStudentInfo", "/mySemesters", "/myCourses",
								"/myReminders", "/myReminders/**",
								"/myEvents", "/myEvents/**",
								"/myHolidays", "/myHolidays/**",
								"/myHomework", "/myHomework/**",
								"/myExams", "/myExams/**",
								"/myCourseWeeklySchedule",
								"/myHomework", "/myExams", "/updateStudentInfo", "/addCourse",
								"/addCourseWeeklySchedule", "/deleteCourse/**",
								"/deleteCourseWeeklySchedule/**")
						.hasAnyRole("USER", "ADMIN")
						.requestMatchers("/myAccount").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/myBalance").hasAnyRole("USER", "ADMIN")
						.requestMatchers("/myLoans").hasRole("USER")
						.requestMatchers("/myCards").hasRole("USER")
						.requestMatchers("/user").authenticated()
						.requestMatchers("/notices", "/contact", "/error", "/register", "/invalidSession", "/csrf-token").permitAll());
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

	/*@Bean
	public UserDetailsService userDetailsService(DataSource dataSource) {
	    return new JdbcUserDetailsManager(dataSource);
	}*/

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
