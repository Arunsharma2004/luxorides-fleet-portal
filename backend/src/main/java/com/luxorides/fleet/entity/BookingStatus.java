package com.luxorides.fleet.entity;

import java.util.List;

public enum BookingStatus {
    PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED;

    // Only these statuses block a vehicle (used by availability and the overlap check)
    public static final List<BookingStatus> ACTIVE = List.of(PENDING, CONFIRMED, IN_PROGRESS);
}