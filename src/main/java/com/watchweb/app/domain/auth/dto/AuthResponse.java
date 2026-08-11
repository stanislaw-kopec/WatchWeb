package com.watchweb.app.domain.auth.dto;

import com.watchweb.app.domain.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Authentication token response")
public record AuthResponse(
        @Schema(description = "Access token type", example = "Bearer")
        String tokenType,

        @Schema(description = "JWT access token")
        String accessToken,

        @Schema(description = "Refresh token")
        String refreshToken,

        @Schema(description = "Authenticated user")
        UserResponse user
) {

    public static AuthResponse bearer(String accessToken, String refreshToken, UserResponse user) {
        return new AuthResponse("Bearer", accessToken, refreshToken, user);
    }
}
