package com.luxorides.fleet.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.luxorides.fleet.dto.BookingRequest;
import com.luxorides.fleet.dto.BookingResponse;
import com.luxorides.fleet.dto.QuoteResponse;
import com.luxorides.fleet.entity.Booking;
import com.luxorides.fleet.entity.BookingStatus;
import com.luxorides.fleet.entity.Chauffeur;
import com.luxorides.fleet.entity.User;
import com.luxorides.fleet.entity.Vehicle;
import com.luxorides.fleet.exception.BookingConflictException;
import com.luxorides.fleet.exception.NotFoundException;
import com.luxorides.fleet.repository.BookingRepository;

@Service
public class BookingService {

    private static final DateTimeFormatter DISPLAY_FORMAT = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    private final BookingRepository bookingRepository;
    private final VehicleService vehicleService;
    private final ChauffeurService chauffeurService;

    public BookingService(BookingRepository bookingRepository,
                          VehicleService vehicleService,
                          ChauffeurService chauffeurService) {
        this.bookingRepository = bookingRepository;
        this.vehicleService = vehicleService;
        this.chauffeurService = chauffeurService;
    }

    public BookingResponse createBooking(BookingRequest request, User customer) {
        Vehicle vehicle = vehicleService.getVehicle(request.vehicleId()); // 404 if missing

        LocalDateTime pickupTime = request.pickupTime();
        LocalDateTime endTime = pickupTime.plusHours(request.durationHours());

        // 409 if the vehicle is busy (including the 2-hour buffer after earlier trips)
        checkVehicleIsFree(vehicle.getId(), pickupTime, endTime);

        // The server always calculates the price itself
        QuoteResponse quote = FareCalculator.calculate(vehicle, request.durationHours(), request.addOns());

        Booking booking = new Booking(customer, request.customerName(), request.customerPhone(),
                vehicle, pickupTime, request.durationHours(),
                new HashSet<>(request.addOns()), quote.totalFare());

        return BookingResponse.from(bookingRepository.save(booking));
    }

    // Admin: all bookings, newest first
    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "id"))
                .stream()
                .map(BookingResponse::from)
                .toList();
    }

    // Admin: assign a chauffeur (must be available for this booking)
    public BookingResponse assignChauffeur(Long bookingId, Long chauffeurId) {
        Booking booking = getBooking(bookingId);
        Chauffeur chauffeur = chauffeurService.getChauffeur(chauffeurId);

        if (!chauffeurService.isAvailableFor(chauffeur, booking)) {
            throw new BookingConflictException("Chauffeur " + chauffeur.getName()
                    + " is not available for this booking (check city, status and other trips).");
        }

        booking.setChauffeur(chauffeur);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    // Admin: change the booking status (a CANCELLED or COMPLETED booking stops blocking the vehicle)
    public BookingResponse updateStatus(Long bookingId, BookingStatus status) {
        Booking booking = getBooking(bookingId);
        booking.setStatus(status);
        return BookingResponse.from(bookingRepository.save(booking));
    }

    private Booking getBooking(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found with id " + bookingId));
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