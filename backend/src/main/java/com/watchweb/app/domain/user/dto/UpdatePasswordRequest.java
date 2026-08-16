package com.watchweb.app.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Update password request")
public record UpdatePasswordRequest(
        @NotBlank
        @Schema(description = "Current raw password", example = "StrongPassword123")
        String currentPassword,

        @NotBlank
        @Size(min = 8, max = 72)
        @Schema(description = "New raw password. It is stored only as a BCrypt hash.", example = "NewStrongPassword123")
        String newPassword
) {
}
