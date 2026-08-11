package com.watchweb.app.domain.watch.dto;

import com.watchweb.app.domain.watch.entity.WatchSubmission;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Watch submission item for moderator review")
public record ModerationWatchSubmissionResponse(
        @Schema(description = "Unique submission identifier", example = "9f7a0c1b-3ef1-4d2d-9b5b-9c653dd9e5a1")
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

        @Schema(description = "Reason provided when the submission was rejected", example = "Model already exists under another reference")
        String rejectionReason,

        @Schema(description = "Identifier of the user who submitted the watch")
        UUID submittedById,

        @Schema(description = "Username of the user who submitted the watch", example = "janek")
        String submittedByUsername,

        @Schema(description = "Creation timestamp", example = "2026-08-11T18:30:00Z")
        Instant createdAt,

        @Schema(description = "Last update timestamp", example = "2026-08-11T18:45:00Z")
        Instant updatedAt
) {

    public static ModerationWatchSubmissionResponse fromEntity(WatchSubmission submission) {
        return new ModerationWatchSubmissionResponse(
                submission.getId(),
                submission.getBrand(),
                submission.getModel(),
                submission.getReferenceCode(),
                WatchDetailsResponse.fromEntity(submission.getDetails()),
                submission.getStatus(),
                submission.getRejectionReason(),
                submission.getSubmittedBy().getId(),
                submission.getSubmittedBy().getUsername(),
                submission.getCreatedAt(),
                submission.getUpdatedAt()
        );
    }
}
