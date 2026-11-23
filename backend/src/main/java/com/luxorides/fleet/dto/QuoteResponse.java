package com.luxorides.fleet.dto;

import java.math.BigDecimal;
import java.util.List;

import com.luxorides.fleet.entity.AddOn;

// Itemized fare breakdown shown to the customer
public record QuoteResponse(
        Long vehicleId,
        String vehicleName,
        int durationHours,
        BigDecimal basePackagePrice,
        int includedHours,
        int extraHours,
        BigDecimal extraHourRate,
        BigDecimal extraHoursCharge,
        List<AddOnLine> addOns,
        BigDecimal addOnsTotal,
        BigDecimal totalFare) {

    public record AddOnLine(AddOn addOn, String label, BigDecimal price) {
    }
}