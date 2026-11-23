package com.luxorides.fleet.dto;

import com.luxorides.fleet.entity.BookingStatus;

import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(@NotNull(message = "is required") BookingStatus status) {
}