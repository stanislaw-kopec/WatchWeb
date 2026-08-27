package com.watchweb.app.domain.post.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Uploaded post image response")
public record PostImageResponse(
        @Schema(description = "URL of the uploaded image")
        String url
) {
}
