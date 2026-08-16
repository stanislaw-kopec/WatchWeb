package com.watchweb.app.domain.auth.dto;

import com.watchweb.app.domain.user.dto.UserResponse;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User registration response")
public record RegisterResponse(
        @Schema(description = "Created user")
        UserResponse user
) {
}
