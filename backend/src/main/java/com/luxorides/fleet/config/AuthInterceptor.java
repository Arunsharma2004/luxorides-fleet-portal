package com.luxorides.fleet.config;

import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import com.luxorides.fleet.entity.Role;
import com.luxorides.fleet.entity.User;
import com.luxorides.fleet.exception.ForbiddenException;
import com.luxorides.fleet.exception.UnauthorizedException;
import com.luxorides.fleet.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

// Runs before every protected endpoint: checks the token and (for @AdminOnly) the role
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String CURRENT_USER = "currentUser";

    private final UserRepository userRepository;

    public AuthInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Browsers send a token-less OPTIONS "preflight" request first; let it through
        if (CorsUtils.isPreFlightRequest(request)) {
            return true;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            throw new UnauthorizedException("Login required. Send the header: Authorization: Bearer <token>");
        }

        String token = header.substring("Bearer ".length());
        User user = userRepository.findByToken(token)
                .orElseThrow(() -> new UnauthorizedException("Invalid token. Please log in again."));

        if (handler instanceof HandlerMethod handlerMethod
                && handlerMethod.hasMethodAnnotation(AdminOnly.class)
                && user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Admin access required.");
        }

        request.setAttribute(CURRENT_USER, user);
        return true;
    }
}