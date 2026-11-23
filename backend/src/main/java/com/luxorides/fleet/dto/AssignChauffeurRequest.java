package com.luxorides.fleet.dto;

import jakarta.validation.constraints.NotNull;

public record AssignChauffeurRequest(@NotNull(message = "is required") Long chauffeurId) {
}