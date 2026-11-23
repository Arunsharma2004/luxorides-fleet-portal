package com.luxorides.fleet.entity;

import java.math.BigDecimal;

public enum AddOn {
    CHILD_SEAT("Child Seat", new BigDecimal("500")),
    AIRPORT_MEET_AND_GREET("Airport Meet & Greet", new BigDecimal("1000")),
    REFRESHMENTS("Water & Refreshments", new BigDecimal("300"));

    private final String label;
    private final BigDecimal price;

    AddOn(String label, BigDecimal price) {
        this.label = label;
        this.price = price;
    }

    public String getLabel() {
        return label;
    }

    public BigDecimal getPrice() {
        return price;
    }
}