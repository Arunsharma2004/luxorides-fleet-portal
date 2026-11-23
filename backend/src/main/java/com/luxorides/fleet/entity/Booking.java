package com.luxorides.fleet.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.*;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Who booked (the logged-in customer account)
    @ManyToOne(optional = false)
    @JoinColumn(name = "customer_id")
    private User customer;

    // Customer details entered on the booking form
    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerPhone;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    // Empty until an admin assigns a chauffeur
    @ManyToOne
    @JoinColumn(name = "chauffeur_id")
    private Chauffeur chauffeur;

    @Column(nullable = false)
    private LocalDateTime pickupTime;

    @Column(nullable = false)
    private int durationHours;

    // pickupTime + durationHours, saved so the overlap check is a simple comparison
    @Column(nullable = false)
    private LocalDateTime endTime;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "booking_add_ons", joinColumns = @JoinColumn(name = "booking_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "add_on")
    private Set<AddOn> addOns = new HashSet<>();

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFare;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    protected Booking() {
    }

    public Booking(User customer, String customerName, String customerPhone, Vehicle vehicle,
                   LocalDateTime pickupTime, int durationHours, Set<AddOn> addOns,
                   BigDecimal totalFare) {
        this.customer = customer;
        this.customerName = customerName;
        this.customerPhone = customerPhone;
        this.vehicle = vehicle;
        this.pickupTime = pickupTime;
        this.durationHours = durationHours;
        this.endTime = pickupTime.plusHours(durationHours);
        this.addOns = addOns;
        this.totalFare = totalFare;
        this.status = BookingStatus.PENDING;
    }

    public Long getId() { return id; }
    public User getCustomer() { return customer; }
    public String getCustomerName() { return customerName; }
    public String getCustomerPhone() { return customerPhone; }
    public Vehicle getVehicle() { return vehicle; }
    public Chauffeur getChauffeur() { return chauffeur; }
    public void setChauffeur(Chauffeur chauffeur) { this.chauffeur = chauffeur; }
    public LocalDateTime getPickupTime() { return pickupTime; }
    public int getDurationHours() { return durationHours; }
    public LocalDateTime getEndTime() { return endTime; }
    public Set<AddOn> getAddOns() { return addOns; }
    public BigDecimal getTotalFare() { return totalFare; }
    public BookingStatus getStatus() { return status; }
    public void setStatus(BookingStatus status) { this.status = status; }
}