package com.watchweb.app.domain.review.dto;

import com.watchweb.app.domain.review.entity.Review;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Current user's review response")
public record UserReviewResponse(
        @Schema(description = "Unique review identifier")
        UUID id,

        @Schema(description = "Reviewed watch identifier")
        UUID watchId,

        @Schema(description = "Reviewed watch brand", example = "Seiko")
        String watchBrand,

        @Schema(description = "Reviewed watch model", example = "SKX007")
        String watchModel,

        @Schema(description = "Rating from 1 to 10", example = "8")
        int rating,

        @Schema(description = "Review text")
        String content,

        @Schema(description = "Creation timestamp", example = "2026-08-11T18:30:00Z")
        Instant createdAt
) {

    public static UserReviewResponse fromEntity(Review review) {
        return new UserReviewResponse(
                review.getId(),
                review.getWatch().getId(),
                review.getWatch().getBrand(),
                review.getWatch().getModel(),
                review.getRating(),
                review.getContent(),
                review.getCreatedAt()
        );
    }
}
