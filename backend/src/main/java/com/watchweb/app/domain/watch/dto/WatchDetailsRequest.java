package com.watchweb.app.domain.watch.dto;

import com.watchweb.app.domain.watch.entity.MovementType;
import com.watchweb.app.domain.watch.entity.WatchDetails;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

@Schema(description = "Technical watch details")
public record WatchDetailsRequest(
        @Schema(description = "Movement type", example = "AUTOMATIC")
        MovementType movementType,

        @Size(max = 100)
        @Schema(description = "Movement caliber", example = "7S26")
        String caliber,

        @DecimalMin("0.0")
        @Schema(description = "Case diameter in millimeters", example = "42.50")
        BigDecimal caseDiameterMm,

        @DecimalMin("0.0")
        @Schema(description = "Case thickness in millimeters", example = "13.25")
        BigDecimal caseThicknessMm,

        @DecimalMin("0.0")
        @Schema(description = "Lug-to-lug size in millimeters", example = "46.00")
        BigDecimal lugToLugMm,

        @DecimalMin("0.0")
        @Schema(description = "Strap width in millimeters", example = "22.00")
        BigDecimal strapWidthMm,

        @Min(0)
        @Schema(description = "Water resistance in meters", example = "200")
        Integer waterResistanceM,

        @Size(max = 100)
        @Schema(description = "Crystal type", example = "Hardlex")
        String crystalType,

        @Size(max = 100)
        @Schema(description = "Case material", example = "Stainless steel")
        String caseMaterial
) {

    public WatchDetails toEntity() {
        return new WatchDetails(
                movementType,
                caliber,
                caseDiameterMm,
                caseThicknessMm,
                lugToLugMm,
                strapWidthMm,
                waterResistanceM,
                crystalType,
                caseMaterial
        );
    }
}
