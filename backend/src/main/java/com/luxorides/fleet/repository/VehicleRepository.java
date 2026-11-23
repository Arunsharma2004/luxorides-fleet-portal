package com.luxorides.fleet.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luxorides.fleet.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
}