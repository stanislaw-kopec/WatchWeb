package com.watchweb.app.domain.post.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "Save user post draft request")
public record SavePostDraftRequest(
        @Schema(description = "Draft title; it may be empty until submission", example = "My first month with the Seiko Alpinist")
        @Size(max = 200)
        String title,

        @Schema(description = "Draft content; it may be empty until submission")
        @Size(max = 10000)
        String content,

        @Schema(description = "Post hashtags. Values replace the previous hashtag list.", example = "[\"Seiko\", \"#Alpinist\"]")
        @Size(max = 10)
        List<@Size(max = 100) String> hashtags
) {

    public SavePostDraftRequest(String title, String content) {
        this(title, content, List.of());
    }

    public SavePostDraftRequest {
        title = title == null ? "" : title;
        content = content == null ? "" : content;
        hashtags = hashtags == null ? List.of() : List.copyOf(hashtags);
    }
}
