package com.watchweb.app.domain.post.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Update user post request")
public record UpdatePostRequest(
        @Schema(description = "Post title", example = "Updated thoughts about the Seiko Alpinist")
        @NotBlank
        @Size(max = 200)
        String title,

        @Schema(description = "Post content", example = "After another month I changed my mind about the bracelet.")
        @NotBlank
        @Size(max = 10000)
        String content
) {
}
