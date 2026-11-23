package com.luxorides.fleet.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luxorides.fleet.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByToken(String token);
}