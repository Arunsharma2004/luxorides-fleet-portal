package com.luxorides.fleet.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.luxorides.fleet.config.AdminOnly;
import com.luxorides.fleet.entity.Chauffeur;
import com.luxorides.fleet.service.ChauffeurService;

@RestController
@RequestMapping("/api/chauffeurs")
public class ChauffeurController {

    private final ChauffeurService chauffeurService;

    public ChauffeurController(ChauffeurService chauffeurService) {
        this.chauffeurService = chauffeurService;
    }

    @GetMapping("/available")
    @AdminOnly
    public List<Chauffeur> getAvailableChauffeurs(@RequestParam Long bookingId) {
        return chauffeurService.getAvailableChauffeurs(bookingId);
    }
}