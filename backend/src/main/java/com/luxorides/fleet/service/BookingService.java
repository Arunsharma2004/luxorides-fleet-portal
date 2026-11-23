package com.luxorides.fleet.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;

import com.luxorides.fleet.dto.BookingRequest;
import com.luxorides.fleet.dto.BookingResponse;
import com.luxorides.fleet.dto.QuoteResponse;
import com.luxorides.fleet.entity.Booking;
import com.luxorides.fleet.entity.BookingStatus;
import com.luxorides.fleet.entity.User;
import com.luxorides.fleet.entity.Vehicle;
import com.luxorides.fleet.exception.BookingConflictException;
import com.luxorides.fleet.exception.NotFoundException;
import com.luxorides.fleet.repository.BookingRepository;
import com.luxorides.fleet.repository.UserRepository;

@Service
public class BookingService {

    // TEMPORARY: until login is built (feature 6), bookings belong to the seeded demo customer
    private static final String DEMO_CUSTOMER_EMAIL = "customer@luxorides.com";

    private static final DateTimeFormatter DISPLAY_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final VehicleService vehicleService;

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          VehicleService vehicleService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.vehicleService = vehicleService;
    }

    public BookingResponse createBooking(BookingRequest request) {
        Vehicle vehicle = vehicleService.getVehicle(request.vehicleId()); // 404 if missing

        LocalDateTime pickupTime = request.pickupTime();
        LocalDateTime endTime = pickupTime.plusHours(request.durationHours());

        // 409 if the vehicle is busy (including the 2-hour buffer after earlier trips)
        checkVehicleIsFree(vehicle.getId(), pickupTime, endTime);

        // The server always calculates the price itself
        QuoteResponse quote = FareCalculator.calculate(vehicle, request.durationHours(), request.addOns());

        User customer = userRepository.findByEmail(DEMO_CUSTOMER_EMAIL)
                .orElseThrow(() -> new NotFoundException("Demo customer account not found"));

        Booking booking = new Booking(customer, request.customerName(), request.customerPhone(),
                vehicle, pickupTime, request.durationHours(),
                new HashSet<>(request.addOns()), quote.totalFare());

        return BookingResponse.from(bookingRepository.save(booking));
    }

    private void checkVehicleIsFree(Long vehicleId, LocalDateTime newStart, LocalDateTime newEnd) {
        // Step 1 (database): active bookings of this vehicle that could still block newStart,
        // i.e. existing end time is later than (newStart - 2 hours)
        LocalDateTime cutoff = newStart.minusHours(TurnaroundRule.BUFFER_HOURS);
        List<Booking> candidates = bookingRepository
                .findByVehicleIdAndStatusInAndEndTimeAfterOrderByPickupTimeAsc(
                        vehicleId, BookingStatus.ACTIVE, cutoff);

        // Step 2 (the rule): keep the ones that really overlap, and reject if there is any
        candidates.stream()
                .filter(existing -> TurnaroundRule.overlaps(
                        existing.getPickupTime(), existing.getEndTime(), newStart, newEnd))
                .findFirst()
                .ifPresent(existing -> {
                    throw new BookingConflictException(
                            "Vehicle is not available for the selected time. An existing booking blocks it until "
                                    + TurnaroundRule.blockedUntil(existing.getEndTime()).format(DISPLAY_FORMAT)
                                    + " (trip end + 2-hour turnaround).");
                });
    }
}