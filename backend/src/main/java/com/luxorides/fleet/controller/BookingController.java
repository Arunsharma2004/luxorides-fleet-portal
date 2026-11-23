package com.luxorides.fleet.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.luxorides.fleet.config.AdminOnly;
import com.luxorides.fleet.config.AuthInterceptor;
import com.luxorides.fleet.dto.AssignChauffeurRequest;
import com.luxorides.fleet.dto.BookingRequest;
import com.luxorides.fleet.dto.BookingResponse;
import com.luxorides.fleet.dto.UpdateStatusRequest;
import com.luxorides.fleet.entity.User;
import com.luxorides.fleet.service.BookingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // Any logged-in user; the booking is saved under that user
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(
            @RequestAttribute(AuthInterceptor.CURRENT_USER) User customer,
            @Valid @RequestBody BookingRequest request) {
        return bookingService.createBooking(request, customer);
    }

    @GetMapping
    @AdminOnly
    public List<BookingResponse> getAllBookings() {
        return bookingService.getAllBookings();
    }

    @PutMapping("/{id}/chauffeur")
    @AdminOnly
    public BookingResponse assignChauffeur(@PathVariable Long id,
                                           @Valid @RequestBody AssignChauffeurRequest request) {
        return bookingService.assignChauffeur(id, request.chauffeurId());
    }

    @PatchMapping("/{id}/status")
    @AdminOnly
    public BookingResponse updateStatus(@PathVariable Long id,
                                        @Valid @RequestBody UpdateStatusRequest request) {
        return bookingService.updateStatus(id, request.status());
    }
}