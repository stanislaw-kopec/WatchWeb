package com.watchweb.app.domain.comment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(description = "Create post comment request")
public record CreatePostCommentRequest(
        @Schema(description = "Parent comment identifier for replies")
        UUID parentId,

        @Schema(description = "Comment content", example = "I agree, this strap really changes the whole watch.")
        @NotBlank
        @Size(max = 2000)
        String content
) {
}
