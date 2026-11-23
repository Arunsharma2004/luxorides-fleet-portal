package com.luxorides.fleet.exception;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

// Turns exceptions thrown anywhere into clean JSON errors with the right HTTP status
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponse handleNotFound(NotFoundException ex) {
        return new ErrorResponse(404, ex.getMessage());
    }

    // The vehicle (or chauffeur) is already taken for the requested time
    @ExceptionHandler(BookingConflictException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponse handleConflict(BookingConflictException ex) {
        return new ErrorResponse(409, ex.getMessage());
    }

    // No token, wrong token, or wrong email/password
    @ExceptionHandler(UnauthorizedException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleUnauthorized(UnauthorizedException ex) {
        return new ErrorResponse(401, ex.getMessage());
    }

    // Valid token, but the user's role is not allowed
    @ExceptionHandler(ForbiddenException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleForbidden(ForbiddenException ex) {
        return new ErrorResponse(403, ex.getMessage());
    }

    // A field failed validation, e.g. durationHours = 0
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + " " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return new ErrorResponse(400, message);
    }

    // Body is not valid JSON, or has an unknown add-on/status name or wrong field type
    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponse handleUnreadableBody(HttpMessageNotReadableException ex) {
        return new ErrorResponse(400, "Invalid request body. Check field types and enum values.");
    }
}