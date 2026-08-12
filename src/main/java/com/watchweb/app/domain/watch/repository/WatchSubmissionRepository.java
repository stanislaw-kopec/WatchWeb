package com.watchweb.app.domain.watch.repository;

import com.watchweb.app.domain.watch.entity.WatchSubmission;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface WatchSubmissionRepository extends JpaRepository<WatchSubmission, UUID> {

    @EntityGraph(attributePaths = "submittedBy")
    Page<WatchSubmission> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "submittedBy")
    Page<WatchSubmission> findByStatus(WatchSubmissionStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "submittedBy")
    Page<WatchSubmission> findBySubmittedById(UUID submittedById, Pageable pageable);

    @EntityGraph(attributePaths = "submittedBy")
    Page<WatchSubmission> findBySubmittedByIdAndStatus(
            UUID submittedById,
            WatchSubmissionStatus status,
            Pageable pageable
    );

    boolean existsByBrandNormalizedAndModelNormalizedAndStatus(
            String brandNormalized,
            String modelNormalized,
            WatchSubmissionStatus status
    );
}
