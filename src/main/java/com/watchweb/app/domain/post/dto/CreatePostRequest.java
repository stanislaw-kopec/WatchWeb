package com.watchweb.app.domain.post.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Create user post request")
public record CreatePostRequest(
        @Schema(description = "Post title", example = "My first month with the Seiko Alpinist")
        @NotBlank
        @Size(max = 200)
        String title,

        @Schema(description = "Post content", example = "After wearing it daily, I think the case size is close to perfect.")
        @NotBlank
        @Size(max = 10000)
        String content
) {
}
