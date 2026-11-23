package com.luxorides.fleet.service;

import java.time.LocalDateTime;

public final class TurnaroundRule {

    // After a trip ends, the vehicle needs 2 hours for refuelling, transit and detailing
    public static final int BUFFER_HOURS = 2;

    private TurnaroundRule() {
    }

    public static LocalDateTime blockedUntil(LocalDateTime tripEnd) {
        return tripEnd.plusHours(BUFFER_HOURS);
    }
}