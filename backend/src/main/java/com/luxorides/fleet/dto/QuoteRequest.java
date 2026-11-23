package com.luxorides.fleet.dto;

import java.util.Set;

import com.luxorides.fleet.entity.AddOn;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record QuoteRequest(
        @NotNull(message = "is required") Long vehicleId,
        @Min(value = 1, message = "must be at least 1 hour")
        @Max(value = 24, message = "must be at most 24 hours") int durationHours,
        Set<AddOn> addOns) {

    // No add-ons selected = empty set, so the rest of the code never sees null
    public QuoteRequest {
        if (addOns == null) {
            addOns = Set.of();
        }
    }
}