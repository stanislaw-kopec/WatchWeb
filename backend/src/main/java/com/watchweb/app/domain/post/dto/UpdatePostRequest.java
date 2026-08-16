package com.watchweb.app.domain.post.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Update user post request")
public record UpdatePostRequest(
        @Schema(description = "Post title", example = "Updated thoughts about the Seiko Alpinist")
        @NotBlank
        @Size(max = 200)
        String title,

        @Schema(description = "Post content", example = "After another month I changed my mind about the bracelet.")
        @NotBlank
        @Size(max = 10000)
        String content,

        @Schema(description = "Post hashtags. Values replace the previous hashtag list.", example = "[\"Seiko\", \"Bracelet\"]")
        @Size(max = 10)
        List<@Size(max = 100) String> hashtags
) {

    public UpdatePostRequest(String title, String content) {
        this(title, content, List.of());
    }

    public UpdatePostRequest {
        hashtags = hashtags == null ? List.of() : List.copyOf(hashtags);
    }
}
