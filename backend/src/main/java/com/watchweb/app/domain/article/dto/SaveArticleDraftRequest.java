package com.watchweb.app.domain.article.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "Save article draft request")
public record SaveArticleDraftRequest(
        @Schema(description = "Draft title; it may be empty until publication", example = "How microbrands changed modern watch collecting")
        @NotNull
        @Size(max = 200)
        String title,

        @Schema(description = "Draft content; it may be empty until publication")
        @NotNull
        @Size(max = 30000)
        String content
) {
}
