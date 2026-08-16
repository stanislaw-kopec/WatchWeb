package com.watchweb.app.domain.watch.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Watch catalog submission request")
public record CreateWatchSubmissionRequest(
        @NotBlank
        @Size(max = 100)
        @Schema(description = "Watch brand", example = "Seiko")
        String brand,

        @NotBlank
        @Size(max = 150)
        @Schema(description = "Watch model", example = "SKX007")
        String model,

        @Size(max = 100)
        @Schema(description = "Reference code", example = "SKX007K2")
        String referenceCode,

        @Valid
        @Schema(description = "Technical details")
        WatchDetailsRequest details
) {
}
