package com.watchweb.app.domain.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Update watch review request")
public record UpdateReviewRequest(
        @Schema(description = "Rating from 1 to 10", example = "9")
        @Min(1)
        @Max(10)
        int rating,

        @Schema(description = "Updated review text", example = "After a few weeks, this watch is even better than expected.")
        @NotBlank
        @Size(max = 5000)
        String content
) {
}
