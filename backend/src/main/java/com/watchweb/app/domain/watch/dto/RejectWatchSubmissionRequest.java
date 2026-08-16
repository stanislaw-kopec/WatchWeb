package com.watchweb.app.domain.watch.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Reject watch submission request")
public record RejectWatchSubmissionRequest(
        @NotBlank
        @Size(max = 500)
        @Schema(description = "Reason for rejecting the submission", example = "Model already exists under another reference.")
        String reason
) {
}
