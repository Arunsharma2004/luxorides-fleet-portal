package com.luxorides.fleet.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luxorides.fleet.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
}