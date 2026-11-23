package com.luxorides.fleet.service;

import java.time.LocalDateTime;

public final class TurnaroundRule {

    // After a trip ends, the vehicle needs 2 hours for refuelling, transit and detailing
    public static final int BUFFER_HOURS = 2;

    private TurnaroundRule() {
    }

    // An existing trip blocks the vehicle until its end time + 2 hours
    public static LocalDateTime blockedUntil(LocalDateTime tripEnd) {
        return tripEnd.plusHours(BUFFER_HOURS);
    }

    // The new trip [newStart, newEnd] conflicts with the existing trip when it starts
    // before the existing trip's buffer is over AND ends after the existing trip starts.
    // Strict comparisons: starting exactly when the buffer ends is allowed.
    public static boolean overlaps(LocalDateTime existingStart, LocalDateTime existingEnd,
                                   LocalDateTime newStart, LocalDateTime newEnd) {
        return newStart.isBefore(blockedUntil(existingEnd)) && newEnd.isAfter(existingStart);
    }
}