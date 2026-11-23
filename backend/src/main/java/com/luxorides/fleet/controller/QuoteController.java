package com.luxorides.fleet.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.luxorides.fleet.dto.QuoteRequest;
import com.luxorides.fleet.dto.QuoteResponse;
import com.luxorides.fleet.service.QuoteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    private final QuoteService quoteService;

    public QuoteController(QuoteService quoteService) {
        this.quoteService = quoteService;
    }

    @PostMapping
    public QuoteResponse createQuote(@Valid @RequestBody QuoteRequest request) {
        return quoteService.createQuote(request);
    }
}