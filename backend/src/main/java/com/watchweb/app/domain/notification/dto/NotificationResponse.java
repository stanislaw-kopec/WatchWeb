package com.watchweb.app.domain.notification.dto;

import com.watchweb.app.domain.notification.entity.Notification;
import com.watchweb.app.domain.notification.entity.NotificationType;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Notification response")
public record NotificationResponse(
        @Schema(description = "Unique notification identifier")
        UUID id,

        @Schema(description = "Notification type", example = "POST_APPROVED")
        NotificationType type,

        @Schema(description = "Human-readable notification message")
        String message,

        @Schema(description = "Related resource identifier, for example a post id")
        UUID targetId,

        @Schema(description = "Whether the notification has been read")
        boolean read,

        @Schema(description = "Read timestamp")
        Instant readAt,

        @Schema(description = "Creation timestamp")
        Instant createdAt
) {

    public static NotificationResponse fromEntity(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                notification.getTargetId(),
                notification.isRead(),
                notification.getReadAt(),
                notification.getCreatedAt()
        );
    }
}
