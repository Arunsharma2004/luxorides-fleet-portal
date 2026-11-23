package com.luxorides.fleet;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FleetApplication {

    public static void main(String[] args) {
        // All booking times are in Indian Standard Time.
        // Also avoids the "Asia/Calcutta" timezone error with PostgreSQL 16.
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(FleetApplication.class, args);
    }
}