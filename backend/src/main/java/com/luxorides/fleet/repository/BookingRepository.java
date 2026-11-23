package com.luxorides.fleet.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luxorides.fleet.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
}