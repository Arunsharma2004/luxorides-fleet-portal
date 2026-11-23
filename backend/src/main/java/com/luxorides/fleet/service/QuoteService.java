package com.luxorides.fleet.service;

import org.springframework.stereotype.Service;

import com.luxorides.fleet.dto.QuoteRequest;
import com.luxorides.fleet.dto.QuoteResponse;
import com.luxorides.fleet.entity.Vehicle;

@Service
public class QuoteService {

    private final VehicleService vehicleService;

    public QuoteService(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    public QuoteResponse createQuote(QuoteRequest request) {
        Vehicle vehicle = vehicleService.getVehicle(request.vehicleId());
        return FareCalculator.calculate(vehicle, request.durationHours(), request.addOns());
    }
}