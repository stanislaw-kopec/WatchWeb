package com.watchweb.app.domain.article.dto;

import com.watchweb.app.domain.article.entity.Article;
import com.watchweb.app.domain.article.entity.ArticleStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

@Schema(description = "Article response")
public record ArticleResponse(
        @Schema(description = "Unique article identifier")
        UUID id,

        @Schema(description = "Author identifier")
        UUID authorId,

        @Schema(description = "Author username", example = "redaktor")
        String authorUsername,

        @Schema(description = "Article title", example = "How microbrands changed modern watch collecting")
        String title,

        @Schema(description = "Article content")
        String content,

        @Schema(description = "Article header image URL")
        String headerImageUrl,

        @Schema(description = "Article lifecycle status", example = "PUBLISHED")
        ArticleStatus status,

        @Schema(description = "Publication timestamp; null for a draft", example = "2026-08-11T19:00:00Z")
        Instant publishedAt,

        @Schema(description = "Creation timestamp", example = "2026-08-11T18:30:00Z")
        Instant createdAt,

        @Schema(description = "Last update timestamp", example = "2026-08-11T19:00:00Z")
        Instant updatedAt
) {

    public static ArticleResponse fromEntity(Article article) {
        return new ArticleResponse(
                article.getId(),
                article.getAuthor().getId(),
                article.getAuthor().getUsername(),
                article.getTitle(),
                article.getContent(),
                article.getHeaderImageUrl(),
                article.getStatus(),
                article.getPublishedAt(),
                article.getCreatedAt(),
                article.getUpdatedAt()
        );
    }
}
