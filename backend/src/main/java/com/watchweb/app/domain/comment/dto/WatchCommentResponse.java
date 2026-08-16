package com.watchweb.app.domain.comment.dto;

import com.watchweb.app.domain.comment.entity.WatchComment;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Schema(description = "Watch comment response")
public record WatchCommentResponse(
        @Schema(description = "Unique comment identifier")
        UUID id,

        @Schema(description = "Parent comment identifier")
        UUID parentId,

        @Schema(description = "Author identifier")
        UUID authorId,

        @Schema(description = "Author username", example = "janek")
        String authorUsername,

        @Schema(description = "Comment content. Deleted comments return null.")
        String content,

        @Schema(description = "Comment depth in the tree", example = "1")
        int depth,

        @Schema(description = "Whether the comment has been soft-deleted")
        boolean deleted,

        @Schema(description = "Creation timestamp", example = "2026-08-11T18:30:00Z")
        Instant createdAt,

        @Schema(description = "Nested replies")
        List<WatchCommentResponse> children
) {

    public static WatchCommentResponse fromEntity(WatchComment comment, List<WatchCommentResponse> children) {
        return new WatchCommentResponse(
                comment.getId(),
                comment.getParent() == null ? null : comment.getParent().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getUsername(),
                comment.isDeleted() ? null : comment.getContent(),
                comment.getDepth(),
                comment.isDeleted(),
                comment.getCreatedAt(),
                children
        );
    }
}
