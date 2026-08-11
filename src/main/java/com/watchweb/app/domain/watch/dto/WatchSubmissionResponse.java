package com.watchweb.app.domain.watch.dto;

import com.watchweb.app.domain.watch.entity.WatchSubmission;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Watch submission response")
public record WatchSubmissionResponse(
        UUID id,
        String brand,
        String model,
        String referenceCode,
        WatchDetailsResponse details,
        WatchSubmissionStatus status,
        String message,
        Instant createdAt
) {

    public static WatchSubmissionResponse fromEntity(WatchSubmission submission, String message) {
        return new WatchSubmissionResponse(
                submission.getId(),
                submission.getBrand(),
                submission.getModel(),
                submission.getReferenceCode(),
                WatchDetailsResponse.fromEntity(submission.getDetails()),
                submission.getStatus(),
                message,
                submission.getCreatedAt()
        );
    }
}
