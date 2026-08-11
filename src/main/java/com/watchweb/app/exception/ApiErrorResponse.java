package com.watchweb.app.exception;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.Map;

@Schema(description = "Standard API error response")
public record ApiErrorResponse(
        @Schema(description = "Error timestamp", example = "2026-08-11T18:30:00Z")
        Instant timestamp,

        @Schema(description = "HTTP status code", example = "404")
        int status,

        @Schema(description = "HTTP status reason", example = "Not Found")
        String error,

        @Schema(description = "Human-readable error message", example = "User not found: 9f7a0c1b-3ef1-4d2d-9b5b-9c653dd9e5a1")
        String message,

        @Schema(description = "Request path", example = "/api/users/9f7a0c1b-3ef1-4d2d-9b5b-9c653dd9e5a1")
        String path,

        @Schema(description = "Validation errors keyed by field name")
        Map<String, String> fieldErrors
) {

    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(Instant.now(), status, error, message, path, Map.of());
    }

    public static ApiErrorResponse withFieldErrors(
            int status,
            String error,
            String message,
            String path,
            Map<String, String> fieldErrors
    ) {
        return new ApiErrorResponse(Instant.now(), status, error, message, path, fieldErrors);
    }
}
