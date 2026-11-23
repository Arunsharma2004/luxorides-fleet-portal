package com.luxorides.fleet.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luxorides.fleet.entity.Chauffeur;

public interface ChauffeurRepository extends JpaRepository<Chauffeur, Long> {
}