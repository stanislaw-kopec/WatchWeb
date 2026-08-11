package com.watchweb.app.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Refresh access token request")
public record RefreshTokenRequest(
        @NotBlank
        @Schema(description = "Refresh token returned by login or refresh endpoint")
        String refreshToken
) {
}
