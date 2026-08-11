package com.watchweb.app.domain.watch.dto;

import com.watchweb.app.domain.watch.entity.Watch;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Schema(description = "Approved watch catalog response")
public record WatchResponse(
        UUID id,
        String brand,
        String model,
        String referenceCode,
        WatchDetailsResponse details,
        BigDecimal averageRating,
        int reviewsCount,
        Instant createdAt
) {

    public static WatchResponse fromEntity(Watch watch) {
        return new WatchResponse(
                watch.getId(),
                watch.getBrand(),
                watch.getModel(),
                watch.getReferenceCode(),
                WatchDetailsResponse.fromEntity(watch.getDetails()),
                watch.getAverageRating(),
                watch.getReviewsCount(),
                watch.getCreatedAt()
        );
    }
}
