package com.luxorides.fleet.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import com.luxorides.fleet.entity.Category;
import com.luxorides.fleet.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    List<Vehicle> findByCityIgnoreCase(String city, Sort sort);

    List<Vehicle> findByCategory(Category category, Sort sort);

    List<Vehicle> findByCityIgnoreCaseAndCategory(String city, Category category, Sort sort);
}