package com.watchweb.app.domain.user.dto;

import com.watchweb.app.domain.user.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Update user role request")
public record UpdateUserRoleRequest(
        @NotNull
        @Schema(description = "Role to assign to the user", example = "ROLE_MODERATOR")
        Role role
) {
}
