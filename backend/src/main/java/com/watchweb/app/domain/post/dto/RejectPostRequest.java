package com.watchweb.app.domain.post.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Reject post request")
public record RejectPostRequest(
        @Schema(description = "Reason why the post was rejected", example = "Please remove promotional content.")
        @NotBlank
        @Size(max = 500)
        String reason
) {
}
