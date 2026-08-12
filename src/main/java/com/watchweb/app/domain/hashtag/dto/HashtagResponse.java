package com.watchweb.app.domain.hashtag.dto;

import com.watchweb.app.domain.hashtag.entity.Hashtag;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(description = "Hashtag response")
public record HashtagResponse(
        @Schema(description = "Unique hashtag identifier")
        UUID id,

        @Schema(description = "Normalized hashtag name", example = "seiko")
        String name
) {

    public static HashtagResponse fromEntity(Hashtag hashtag) {
        return new HashtagResponse(hashtag.getId(), hashtag.getName());
    }
}
