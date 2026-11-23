package com.luxorides.fleet.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.luxorides.fleet.entity.Booking;
import com.luxorides.fleet.entity.BookingStatus;
import com.luxorides.fleet.entity.Chauffeur;
import com.luxorides.fleet.entity.ChauffeurStatus;
import com.luxorides.fleet.exception.NotFoundException;
import com.luxorides.fleet.repository.BookingRepository;
import com.luxorides.fleet.repository.ChauffeurRepository;

@Service
public class ChauffeurService {

    private final ChauffeurRepository chauffeurRepository;
    private final BookingRepository bookingRepository;

    public ChauffeurService(ChauffeurRepository chauffeurRepository, BookingRepository bookingRepository) {
        this.chauffeurRepository = chauffeurRepository;
        this.bookingRepository = bookingRepository;
    }

    public Chauffeur getChauffeur(Long id) {
        return chauffeurRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Chauffeur not found with id " + id));
    }

    // Chauffeurs the admin can pick for this booking
    public List<Chauffeur> getAvailableChauffeurs(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found with id " + bookingId));

        return chauffeurRepository
                .findByCityIgnoreCaseAndStatus(booking.getVehicle().getCity(), ChauffeurStatus.AVAILABLE)
                .stream()
                .filter(chauffeur -> hasNoClashingTrip(chauffeur, booking))
                .toList();
    }

    // Available = status AVAILABLE + same city as the vehicle + no clashing trip
    public boolean isAvailableFor(Chauffeur chauffeur, Booking booking) {
        return chauffeur.getStatus() == ChauffeurStatus.AVAILABLE
                && chauffeur.getCity().equalsIgnoreCase(booking.getVehicle().getCity())
                && hasNoClashingTrip(chauffeur, booking);
    }

    // Same overlap rule (with the 2-hour buffer) applied to the chauffeur's other active trips
    private boolean hasNoClashingTrip(Chauffeur chauffeur, Booking booking) {
        return bookingRepository.findByChauffeurIdAndStatusIn(chauffeur.getId(), BookingStatus.ACTIVE)
                .stream()
                .filter(other -> !other.getId().equals(booking.getId()))
                .noneMatch(other -> TurnaroundRule.overlaps(
                        other.getPickupTime(), other.getEndTime(),
                        booking.getPickupTime(), booking.getEndTime()));
    }
}