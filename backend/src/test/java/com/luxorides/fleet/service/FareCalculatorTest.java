package com.luxorides.fleet.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Set;

import org.junit.jupiter.api.Test;

import com.luxorides.fleet.dto.QuoteResponse;
import com.luxorides.fleet.entity.AddOn;
import com.luxorides.fleet.entity.Category;
import com.luxorides.fleet.entity.Vehicle;

class FareCalculatorTest {

    // Base package (8 hrs / 80 km) = 15000, each extra hour = 1800
    private final Vehicle vehicle = new Vehicle("BMW 7 Series", Category.SEDAN, "Delhi NCR",
            new BigDecimal("15000"), new BigDecimal("1800"));

    @Test
    void exactlyEightHours_chargesOnlyTheBasePackage() {
        QuoteResponse quote = FareCalculator.calculate(vehicle, 8, Set.of());

        assertThat(quote.extraHours()).isZero();
        assertThat(quote.extraHoursCharge()).isEqualByComparingTo("0");
        assertThat(quote.totalFare()).isEqualByComparingTo("15000");
    }

    @Test
    void elevenHoursWithChildSeat_addsExtraHoursAndAddOn() {
        QuoteResponse quote = FareCalculator.calculate(vehicle, 11, Set.of(AddOn.CHILD_SEAT));

        assertThat(quote.extraHours()).isEqualTo(3);
        assertThat(quote.extraHoursCharge()).isEqualByComparingTo("5400");   // 3 x 1800
        assertThat(quote.addOnsTotal()).isEqualByComparingTo("500");
        assertThat(quote.totalFare()).isEqualByComparingTo("20900");        // 15000 + 5400 + 500
    }
}