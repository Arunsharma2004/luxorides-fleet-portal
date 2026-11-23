package com.luxorides.fleet.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AvailabilityResponse(Long vehicleId, List<BlockedWindow> blockedWindows) {

    // The vehicle cannot be booked from "from" until "until" (trip end + 2-hour buffer)
    public record BlockedWindow(LocalDateTime from, LocalDateTime until) {
    }
}