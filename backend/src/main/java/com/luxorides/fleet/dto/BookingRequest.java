package com.luxorides.fleet.dto;

import java.time.LocalDateTime;
import java.util.Set;

import com.luxorides.fleet.entity.AddOn;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookingRequest(
        @NotNull(message = "is required") Long vehicleId,
        @NotBlank(message = "is required") String customerName,
        @NotBlank(message = "is required") String customerPhone,
        @NotNull(message = "is required")
        @Future(message = "must be in the future") LocalDateTime pickupTime,
        @Min(value = 1, message = "must be at least 1 hour")
        @Max(value = 24, message = "must be at most 24 hours") int durationHours,
        Set<AddOn> addOns) {

    public BookingRequest {
        if (addOns == null) {
            addOns = Set.of();
        }
    }
}