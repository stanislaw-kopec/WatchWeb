package com.watchweb.app.domain.watch.dto;

import com.watchweb.app.domain.watch.entity.WatchSubmission;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Current user's watch submission response")
public record UserWatchSubmissionResponse(
        @Schema(description = "Unique submission identifier")
        UUID id,

        @Schema(description = "Submitted watch brand", example = "Seiko")
        String brand,

        @Schema(description = "Submitted watch model", example = "SKX007")
        String model,

        @Schema(description = "Submitted watch reference code", example = "SKX007J1")
        String referenceCode,

        WatchDetailsResponse details,

        @Schema(description = "Current moderation status", example = "PENDING")
        WatchSubmissionStatus status,

        @Schema(description = "Reason provided when the submission was rejected")
        String rejectionReason,

        @Schema(description = "Creation timestamp", example = "2026-08-11T18:30:00Z")
        Instant createdAt,

        @Schema(description = "Last update timestamp", example = "2026-08-11T18:45:00Z")
        Instant updatedAt
) {

    public static UserWatchSubmissionResponse fromEntity(WatchSubmission submission) {
        return new UserWatchSubmissionResponse(
                submission.getId(),
                submission.getBrand(),
                submission.getModel(),
                submission.getReferenceCode(),
                WatchDetailsResponse.fromEntity(submission.getDetails()),
                submission.getStatus(),
                submission.getRejectionReason(),
                submission.getCreatedAt(),
                submission.getUpdatedAt()
        );
    }
}
