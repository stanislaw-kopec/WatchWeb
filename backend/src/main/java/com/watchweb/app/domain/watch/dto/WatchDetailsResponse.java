package com.watchweb.app.domain.watch.dto;

import com.watchweb.app.domain.watch.entity.MovementType;
import com.watchweb.app.domain.watch.entity.WatchDetails;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;

@Schema(description = "Technical watch details response")
public record WatchDetailsResponse(
        MovementType movementType,
        String caliber,
        BigDecimal caseDiameterMm,
        BigDecimal caseThicknessMm,
        BigDecimal lugToLugMm,
        BigDecimal strapWidthMm,
        Integer waterResistanceM,
        String crystalType,
        String caseMaterial
) {

    public static WatchDetailsResponse fromEntity(WatchDetails details) {
        if (details == null) {
            return null;
        }

        return new WatchDetailsResponse(
                details.getMovementType(),
                details.getCaliber(),
                details.getCaseDiameterMm(),
                details.getCaseThicknessMm(),
                details.getLugToLugMm(),
                details.getStrapWidthMm(),
                details.getWaterResistanceM(),
                details.getCrystalType(),
                details.getCaseMaterial()
        );
    }
}
