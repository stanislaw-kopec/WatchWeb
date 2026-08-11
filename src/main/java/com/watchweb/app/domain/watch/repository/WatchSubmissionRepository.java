package com.watchweb.app.domain.watch.repository;

import com.watchweb.app.domain.watch.entity.WatchSubmission;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WatchSubmissionRepository extends JpaRepository<WatchSubmission, UUID> {

    boolean existsByBrandNormalizedAndModelNormalizedAndStatus(
            String brandNormalized,
            String modelNormalized,
            WatchSubmissionStatus status
    );
}
