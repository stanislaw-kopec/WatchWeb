package com.watchweb.app.domain.notification.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Unread notifications count response")
public record UnreadNotificationCountResponse(
        @Schema(description = "Number of unread notifications", example = "3")
        long count
) {
}
