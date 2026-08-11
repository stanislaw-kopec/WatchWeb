package com.watchweb.app.domain.article.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Create article request")
public record CreateArticleRequest(
        @Schema(description = "Article title", example = "How microbrands changed modern watch collecting")
        @NotBlank
        @Size(max = 200)
        String title,

        @Schema(description = "Article content", example = "Microbrands have made niche case designs and smaller production runs easier to access.")
        @NotBlank
        @Size(max = 30000)
        String content
) {
}
