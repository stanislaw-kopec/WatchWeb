package com.watchweb.app.domain.review.repository;

import com.watchweb.app.domain.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    @EntityGraph(attributePaths = "reviewer")
    Page<Review> findByWatchId(UUID watchId, Pageable pageable);

    @EntityGraph(attributePaths = {"watch", "reviewer"})
    Page<Review> findByReviewerId(UUID reviewerId, Pageable pageable);

    @EntityGraph(attributePaths = {"watch", "reviewer"})
    Optional<Review> findByIdAndWatchId(UUID id, UUID watchId);

    boolean existsByWatchIdAndReviewerId(UUID watchId, UUID reviewerId);
}
