package com.luxorides.fleet.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.luxorides.fleet.dto.LoginRequest;
import com.luxorides.fleet.dto.LoginResponse;
import com.luxorides.fleet.entity.User;
import com.luxorides.fleet.exception.UnauthorizedException;
import com.luxorides.fleet.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .filter(found -> found.getPassword().equals(request.password()))
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // A new random token on every login; it replaces the previous one
        user.setToken(UUID.randomUUID().toString());
        userRepository.save(user);

        return new LoginResponse(user.getToken(), user.getRole(), user.getName());
    }
}