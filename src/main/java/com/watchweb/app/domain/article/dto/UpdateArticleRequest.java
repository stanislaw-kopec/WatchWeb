package com.watchweb.app.domain.article.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Update article request")
public record UpdateArticleRequest(
        @Schema(description = "Article title", example = "Updated guide to modern microbrands")
        @NotBlank
        @Size(max = 200)
        String title,

        @Schema(description = "Article content", example = "This updated version adds more context about distribution and preorder models.")
        @NotBlank
        @Size(max = 30000)
        String content
) {
}
