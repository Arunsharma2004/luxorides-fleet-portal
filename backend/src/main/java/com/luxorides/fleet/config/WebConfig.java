package com.luxorides.fleet.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthInterceptor authInterceptor;

    public WebConfig(AuthInterceptor authInterceptor) {
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Vehicles, quotes and login stay public; everything below needs a token
        registry.addInterceptor(authInterceptor)
                .addPathPatterns("/api/bookings", "/api/bookings/**", "/api/chauffeurs/**");
    }
}