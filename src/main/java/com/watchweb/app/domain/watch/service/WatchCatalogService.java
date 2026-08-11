package com.watchweb.app.domain.watch.service;

import com.watchweb.app.domain.watch.dto.WatchResponse;
import com.watchweb.app.domain.watch.entity.MovementType;
import com.watchweb.app.domain.watch.entity.Watch;
import com.watchweb.app.domain.watch.repository.WatchRepository;
import com.watchweb.app.domain.watch.repository.WatchSpecifications;
import com.watchweb.app.exception.BadRequestException;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class WatchCatalogService {

    private final WatchRepository watchRepository;
    private final WatchNameNormalizer watchNameNormalizer;

    public WatchCatalogService(WatchRepository watchRepository, WatchNameNormalizer watchNameNormalizer) {
        this.watchRepository = watchRepository;
        this.watchNameNormalizer = watchNameNormalizer;
    }

    @Transactional(readOnly = true)
    public Page<WatchResponse> list(
            String brand,
            MovementType movementType,
            BigDecimal minCaseDiameterMm,
            BigDecimal maxCaseDiameterMm,
            Integer minWaterResistanceM,
            Pageable pageable
    ) {
        validateDiameterRange(minCaseDiameterMm, maxCaseDiameterMm);

        return watchRepository.findAll(
                        buildSpecification(brand, movementType, minCaseDiameterMm, maxCaseDiameterMm, minWaterResistanceM),
                        pageable
                )
                .map(WatchResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public WatchResponse getById(UUID id) {
        return watchRepository.findById(id)
                .map(WatchResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Watch not found: " + id));
    }

    private Specification<Watch> buildSpecification(
            String brand,
            MovementType movementType,
            BigDecimal minCaseDiameterMm,
            BigDecimal maxCaseDiameterMm,
            Integer minWaterResistanceM
    ) {
        Specification<Watch> specification = (root, query, criteriaBuilder) -> criteriaBuilder.conjunction();

        if (StringUtils.hasText(brand)) {
            specification = specification.and(WatchSpecifications.hasBrand(watchNameNormalizer.normalize(brand)));
        }
        if (movementType != null) {
            specification = specification.and(WatchSpecifications.hasMovementType(movementType));
        }
        if (minCaseDiameterMm != null) {
            specification = specification.and(WatchSpecifications.hasCaseDiameterAtLeast(minCaseDiameterMm));
        }
        if (maxCaseDiameterMm != null) {
            specification = specification.and(WatchSpecifications.hasCaseDiameterAtMost(maxCaseDiameterMm));
        }
        if (minWaterResistanceM != null) {
            specification = specification.and(WatchSpecifications.hasWaterResistanceAtLeast(minWaterResistanceM));
        }

        return specification;
    }

    private void validateDiameterRange(BigDecimal minCaseDiameterMm, BigDecimal maxCaseDiameterMm) {
        if (minCaseDiameterMm != null && maxCaseDiameterMm != null && minCaseDiameterMm.compareTo(maxCaseDiameterMm) > 0) {
            throw new BadRequestException("Minimum case diameter cannot be greater than maximum case diameter");
        }
    }
}
