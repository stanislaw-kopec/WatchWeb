package com.watchweb.app.domain.review.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Create watch review request")
public record CreateReviewRequest(
        @Schema(description = "Rating from 1 to 10", example = "8")
        @Min(1)
        @Max(10)
        int rating,

        @Schema(description = "Review text", example = "Comfortable daily watch with a reliable movement.")
        @NotBlank
        @Size(max = 5000)
        String content
) {
}
