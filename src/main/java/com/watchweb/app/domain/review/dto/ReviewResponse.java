package com.watchweb.app.domain.review.dto;

import com.watchweb.app.domain.review.entity.Review;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Watch review response")
public record ReviewResponse(
        @Schema(description = "Unique review identifier")
        UUID id,

        @Schema(description = "Reviewed watch identifier")
        UUID watchId,

        @Schema(description = "Reviewer identifier")
        UUID reviewerId,

        @Schema(description = "Reviewer username", example = "janek")
        String reviewerUsername,

        @Schema(description = "Rating from 1 to 10", example = "8")
        int rating,

        @Schema(description = "Review text")
        String content,

        @Schema(description = "Creation timestamp", example = "2026-08-11T18:30:00Z")
        Instant createdAt
) {

    public static ReviewResponse fromEntity(Review review) {
        return new ReviewResponse(
                review.getId(),
                review.getWatch().getId(),
                review.getReviewer().getId(),
                review.getReviewer().getUsername(),
                review.getRating(),
                review.getContent(),
                review.getCreatedAt()
        );
    }
}
