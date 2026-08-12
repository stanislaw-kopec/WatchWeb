package com.watchweb.app.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Update current user profile request")
public record UpdateUserProfileRequest(
        @NotBlank
        @Size(min = 3, max = 50)
        @Schema(description = "Public username", example = "janek")
        String username,

        @NotBlank
        @Email
        @Size(max = 255)
        @Schema(description = "User email address", example = "janek@example.com")
        String email
) {
}
