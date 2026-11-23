package com.luxorides.fleet.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

import com.luxorides.fleet.dto.QuoteResponse;
import com.luxorides.fleet.dto.QuoteResponse.AddOnLine;
import com.luxorides.fleet.entity.AddOn;
import com.luxorides.fleet.entity.Vehicle;

// Pure calculation, no database: easy to unit test
public final class FareCalculator {

    // The base package covers 8 hours / 80 km
    public static final int BASE_PACKAGE_HOURS = 8;

    private FareCalculator() {
    }

    public static QuoteResponse calculate(Vehicle vehicle, int durationHours, Set<AddOn> addOns) {
        int extraHours = Math.max(0, durationHours - BASE_PACKAGE_HOURS);
        BigDecimal extraHoursCharge = vehicle.getExtraHourRate().multiply(BigDecimal.valueOf(extraHours));

        List<AddOnLine> addOnLines = addOns.stream()
                .sorted()
                .map(addOn -> new AddOnLine(addOn, addOn.getLabel(), addOn.getPrice()))
                .toList();

        BigDecimal addOnsTotal = addOnLines.stream()
                .map(AddOnLine::price)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalFare = vehicle.getBasePackagePrice()
                .add(extraHoursCharge)
                .add(addOnsTotal);

        return new QuoteResponse(
                vehicle.getId(),
                vehicle.getName(),
                durationHours,
                vehicle.getBasePackagePrice(),
                BASE_PACKAGE_HOURS,
                extraHours,
                vehicle.getExtraHourRate(),
                extraHoursCharge,
                addOnLines,
                addOnsTotal,
                totalFare);
    }
}