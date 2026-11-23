package com.luxorides.fleet.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.luxorides.fleet.dto.AvailabilityResponse;
import com.luxorides.fleet.dto.AvailabilityResponse.BlockedWindow;
import com.luxorides.fleet.entity.BookingStatus;
import com.luxorides.fleet.entity.Category;
import com.luxorides.fleet.entity.Vehicle;
import com.luxorides.fleet.exception.NotFoundException;
import com.luxorides.fleet.repository.BookingRepository;
import com.luxorides.fleet.repository.VehicleRepository;

@Service
public class VehicleService {

    private static final Sort BY_ID = Sort.by("id");

    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;

    public VehicleService(VehicleRepository vehicleRepository, BookingRepository bookingRepository) {
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<Vehicle> getVehicles(String city, Category category) {
        boolean hasCity = StringUtils.hasText(city);

        if (hasCity && category != null) {
            return vehicleRepository.findByCityIgnoreCaseAndCategory(city, category, BY_ID);
        }
        if (hasCity) {
            return vehicleRepository.findByCityIgnoreCase(city, BY_ID);
        }
        if (category != null) {
            return vehicleRepository.findByCategory(category, BY_ID);
        }
        return vehicleRepository.findAll(BY_ID);
    }

    public Vehicle getVehicle(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vehicle not found with id " + id));
    }

    public AvailabilityResponse getAvailability(Long vehicleId) {
        getVehicle(vehicleId); // throws 404 if the vehicle does not exist

        // A trip still blocks the vehicle while (end time + 2 hours) is in the future,
        // which is the same as: end time is later than (now - 2 hours)
        LocalDateTime cutoff = LocalDateTime.now().minusHours(TurnaroundRule.BUFFER_HOURS);

        List<BlockedWindow> blockedWindows = bookingRepository
                .findByVehicleIdAndStatusInAndEndTimeAfterOrderByPickupTimeAsc(
                        vehicleId, BookingStatus.ACTIVE, cutoff)
                .stream()
                .map(booking -> new BlockedWindow(
                        booking.getPickupTime(),
                        TurnaroundRule.blockedUntil(booking.getEndTime())))
                .toList();

        return new AvailabilityResponse(vehicleId, blockedWindows);
    }
}