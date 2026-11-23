package com.luxorides.fleet.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.luxorides.fleet.entity.AddOn;
import com.luxorides.fleet.entity.Booking;
import com.luxorides.fleet.entity.BookingStatus;

public record BookingResponse(
        Long id,
        Long vehicleId,
        String vehicleName,
        String city,
        String customerName,
        String customerPhone,
        LocalDateTime pickupTime,
        int durationHours,
        LocalDateTime endTime,
        List<AddOn> addOns,
        BigDecimal totalFare,
        BookingStatus status,
        Long chauffeurId,
        String chauffeurName) {

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                booking.getVehicle().getId(),
                booking.getVehicle().getName(),
                booking.getVehicle().getCity(),
                booking.getCustomerName(),
                booking.getCustomerPhone(),
                booking.getPickupTime(),
                booking.getDurationHours(),
                booking.getEndTime(),
                booking.getAddOns().stream().sorted().toList(),
                booking.getTotalFare(),
                booking.getStatus(),
                booking.getChauffeur() == null ? null : booking.getChauffeur().getId(),
                booking.getChauffeur() == null ? null : booking.getChauffeur().getName());
    }
}