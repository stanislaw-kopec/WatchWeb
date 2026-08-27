package com.watchweb.app.domain.article.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Uploaded article image")
public record ArticleImageResponse(
        @Schema(description = "Public image URL")
        String url
) {
}
