package com.watchweb.app.domain.post.dto;

import com.watchweb.app.domain.post.entity.Post;
import com.watchweb.app.domain.post.entity.PostStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Schema(description = "User post response")
public record PostResponse(
        @Schema(description = "Unique post identifier")
        UUID id,

        @Schema(description = "Author identifier")
        UUID authorId,

        @Schema(description = "Author username", example = "janek")
        String authorUsername,

        @Schema(description = "Post title", example = "My first month with the Seiko Alpinist")
        String title,

        @Schema(description = "Post content")
        String content,

        @Schema(description = "Moderation status", example = "PENDING")
        PostStatus status,

        @Schema(description = "Reason provided when the post was rejected")
        String rejectionReason,

        @Schema(description = "Post image URL")
        String imageUrl,

        @Schema(description = "Normalized hashtags assigned to this post", example = "[\"seiko\", \"alpinist\"]")
        List<String> hashtags,

        @Schema(description = "Creation timestamp", example = "2026-08-11T18:30:00Z")
        Instant createdAt
) {

    public static PostResponse fromEntity(Post post) {
        return new PostResponse(
                post.getId(),
                post.getAuthor().getId(),
                post.getAuthor().getUsername(),
                post.getTitle(),
                post.getContent(),
                post.getStatus(),
                post.getRejectionReason(),
                post.getImageUrl(),
                post.getHashtags().stream()
                        .map(hashtag -> hashtag.getName())
                        .sorted(Comparator.naturalOrder())
                        .toList(),
                post.getCreatedAt()
        );
    }
}
