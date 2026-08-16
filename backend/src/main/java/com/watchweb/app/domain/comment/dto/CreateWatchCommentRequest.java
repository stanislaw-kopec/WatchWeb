package com.watchweb.app.domain.comment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(description = "Create watch comment request")
public record CreateWatchCommentRequest(
        @Schema(description = "Parent comment identifier for replies")
        UUID parentId,

        @Schema(description = "Comment content", example = "I have owned this model for a year and it wears very comfortably.")
        @NotBlank
        @Size(max = 2000)
        String content
) {
}
