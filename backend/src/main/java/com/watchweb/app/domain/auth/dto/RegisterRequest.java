package com.watchweb.app.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "User registration request")
public record RegisterRequest(
        @NotBlank
        @Size(min = 3, max = 50)
        @Schema(description = "Public username", example = "janek")
        String username,

        @NotBlank
        @Email
        @Size(max = 255)
        @Schema(description = "User email address", example = "janek@example.com")
        String email,

        @NotBlank
        @Size(min = 8, max = 72)
        @Schema(description = "Raw password. It is stored only as a BCrypt hash.", example = "StrongPassword123")
        String password
) {
}
