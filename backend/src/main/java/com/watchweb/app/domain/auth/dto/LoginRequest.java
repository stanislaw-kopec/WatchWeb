package com.watchweb.app.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Login request")
public record LoginRequest(
        @NotBlank
        @Email
        @Schema(description = "User email address", example = "janek@example.com")
        String email,

        @NotBlank
        @Schema(description = "Raw password", example = "StrongPassword123")
        String password
) {
}
