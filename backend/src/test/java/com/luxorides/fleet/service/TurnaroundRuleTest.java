package com.luxorides.fleet.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

class TurnaroundRuleTest {

    // Existing trip: 10:00 to 18:00, so the vehicle is blocked until 20:00 (end + 2 hours)
    private static final LocalDateTime EXISTING_START = LocalDateTime.of(2026, 12, 1, 10, 0);
    private static final LocalDateTime EXISTING_END = LocalDateTime.of(2026, 12, 1, 18, 0);

    private boolean overlapsWithNewTripStartingAt(LocalDateTime newStart, int hours) {
        return TurnaroundRule.overlaps(EXISTING_START, EXISTING_END, newStart, newStart.plusHours(hours));
    }

    @Test
    void startingOneMinuteBeforeTheBufferEnds_overlaps() {
        LocalDateTime newStart = LocalDateTime.of(2026, 12, 1, 19, 59);

        assertThat(overlapsWithNewTripStartingAt(newStart, 2)).isTrue();
    }

    @Test
    void startingExactlyTwoHoursAfterThePreviousTripEnds_doesNotOverlap() {
        LocalDateTime newStart = LocalDateTime.of(2026, 12, 1, 20, 0);

        assertThat(overlapsWithNewTripStartingAt(newStart, 2)).isFalse();
    }

    @Test
    void endingExactlyWhenTheExistingTripStarts_doesNotOverlap() {
        LocalDateTime newStart = LocalDateTime.of(2026, 12, 1, 6, 0);

        assertThat(overlapsWithNewTripStartingAt(newStart, 4)).isFalse(); // 06:00 to 10:00
    }
}