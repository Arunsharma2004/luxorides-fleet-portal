package com.luxorides.fleet.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "chauffeurs")
public class Chauffeur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phoneNumber;

    @Column(nullable = false)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChauffeurStatus status;

    protected Chauffeur() {
    }

    public Chauffeur(String name, String phoneNumber, String city, ChauffeurStatus status) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.city = city;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getCity() { return city; }
    public ChauffeurStatus getStatus() { return status; }
}