package com.luxorides.fleet.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luxorides.fleet.entity.Booking;
import com.luxorides.fleet.entity.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    // Active bookings of one vehicle that end after the given time, earliest first
    List<Booking> findByVehicleIdAndStatusInAndEndTimeAfterOrderByPickupTimeAsc(
            Long vehicleId, Collection<BookingStatus> statuses, LocalDateTime endAfter);

    // Trips already assigned to one chauffeur
    List<Booking> findByChauffeurIdAndStatusIn(Long chauffeurId, Collection<BookingStatus> statuses);
}