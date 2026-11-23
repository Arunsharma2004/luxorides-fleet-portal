package com.luxorides.fleet.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Column(nullable = false)
    private String city;

    // Price for the base package: 8 hours / 80 km
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePackagePrice;

    // Charged for every hour beyond 8
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal extraHourRate;

    protected Vehicle() {
    }

    public Vehicle(String name, Category category, String city,
                   BigDecimal basePackagePrice, BigDecimal extraHourRate) {
        this.name = name;
        this.category = category;
        this.city = city;
        this.basePackagePrice = basePackagePrice;
        this.extraHourRate = extraHourRate;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public Category getCategory() { return category; }
    public String getCity() { return city; }
    public BigDecimal getBasePackagePrice() { return basePackagePrice; }
    public BigDecimal getExtraHourRate() { return extraHourRate; }
}