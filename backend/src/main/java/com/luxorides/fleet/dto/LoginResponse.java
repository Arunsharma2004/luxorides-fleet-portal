package com.luxorides.fleet.dto;

import com.luxorides.fleet.entity.Role;

public record LoginResponse(String token, Role role, String name) {
}