package com.collegeplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
//@EnableWebSecurity  //optional for spring boot, mandatory for spring framework
//@EnableJpaRepositories("com.eazybytes.repository")
//@EntityScan("com.eazybytes.model")
public class CollegePlannerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(CollegePlannerBackendApplication.class, args);
	}

}
