package com.luxorides.fleet.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.luxorides.fleet.entity.Chauffeur;
import com.luxorides.fleet.entity.ChauffeurStatus;

public interface ChauffeurRepository extends JpaRepository<Chauffeur, Long> {

    List<Chauffeur> findByCityIgnoreCaseAndStatus(String city, ChauffeurStatus status);
}