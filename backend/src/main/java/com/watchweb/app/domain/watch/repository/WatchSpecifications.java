package com.watchweb.app.domain.watch.repository;

import com.watchweb.app.domain.watch.entity.MovementType;
import com.watchweb.app.domain.watch.entity.Watch;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class WatchSpecifications {

    private WatchSpecifications() {
    }

    public static Specification<Watch> hasBrand(String brandNormalized) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("brandNormalized"), brandNormalized);
    }

    public static Specification<Watch> hasMovementType(MovementType movementType) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("details").get("movementType"), movementType);
    }

    public static Specification<Watch> hasCaseDiameterAtLeast(BigDecimal minCaseDiameterMm) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(root.get("details").get("caseDiameterMm"), minCaseDiameterMm);
    }

    public static Specification<Watch> hasCaseDiameterAtMost(BigDecimal maxCaseDiameterMm) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.lessThanOrEqualTo(root.get("details").get("caseDiameterMm"), maxCaseDiameterMm);
    }

    public static Specification<Watch> hasWaterResistanceAtLeast(Integer minWaterResistanceM) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.greaterThanOrEqualTo(root.get("details").get("waterResistanceM"), minWaterResistanceM);
    }
}
