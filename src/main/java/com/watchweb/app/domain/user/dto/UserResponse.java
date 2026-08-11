package com.watchweb.app.domain.user.dto;

import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "User profile response")
public record UserResponse(
        @Schema(description = "Unique user identifier", example = "9f7a0c1b-3ef1-4d2d-9b5b-9c653dd9e5a1")
        UUID id,

        @Schema(description = "Public username", example = "janek")
        String username,

        @Schema(description = "User email address", example = "janek@example.com")
        String email,

        @Schema(description = "User role", example = "ROLE_USER")
        Role role,

        @Schema(description = "Creation timestamp", example = "2026-08-11T18:30:00Z")
        Instant createdAt
) {

    public static UserResponse fromEntity(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getCreatedAt()
        );
    }
}
