package com.watchweb.app.domain.watch.repository;

import com.watchweb.app.domain.watch.entity.Watch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WatchRepository extends JpaRepository<Watch, UUID> {

    boolean existsByBrandNormalizedAndModelNormalized(String brandNormalized, String modelNormalized);

    Optional<Watch> findByBrandNormalizedAndModelNormalized(String brandNormalized, String modelNormalized);
}
