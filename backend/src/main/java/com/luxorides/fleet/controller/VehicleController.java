package com.luxorides.fleet.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.luxorides.fleet.dto.AvailabilityResponse;
import com.luxorides.fleet.entity.Category;
import com.luxorides.fleet.entity.Vehicle;
import com.luxorides.fleet.service.VehicleService;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public List<Vehicle> getVehicles(@RequestParam(required = false) String city,
                                     @RequestParam(required = false) Category category) {
        return vehicleService.getVehicles(city, category);
    }

    @GetMapping("/{id}")
    public Vehicle getVehicle(@PathVariable Long id) {
        return vehicleService.getVehicle(id);
    }

    @GetMapping("/{id}/availability")
    public AvailabilityResponse getAvailability(@PathVariable Long id) {
        return vehicleService.getAvailability(id);
    }
}