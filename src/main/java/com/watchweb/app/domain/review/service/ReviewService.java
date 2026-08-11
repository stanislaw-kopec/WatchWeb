package com.watchweb.app.domain.review.service;

import com.watchweb.app.domain.review.dto.CreateReviewRequest;
import com.watchweb.app.domain.review.dto.ReviewResponse;
import com.watchweb.app.domain.review.dto.UpdateReviewRequest;
import com.watchweb.app.domain.review.entity.Review;
import com.watchweb.app.domain.review.repository.ReviewRepository;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.domain.watch.repository.WatchRepository;
import com.watchweb.app.exception.DuplicateResourceException;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final WatchRepository watchRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            WatchRepository watchRepository,
            UserRepository userRepository
    ) {
        this.reviewRepository = reviewRepository;
        this.watchRepository = watchRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse create(UUID watchId, UUID reviewerId, CreateReviewRequest request) {
        var watch = watchRepository.findById(watchId)
                .orElseThrow(() -> new ResourceNotFoundException("Watch not found: " + watchId));

        var reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + reviewerId));

        if (reviewRepository.existsByWatchIdAndReviewerId(watchId, reviewerId)) {
            throw new DuplicateResourceException("User has already reviewed this watch.");
        }

        var review = new Review(watch, reviewer, request.rating(), request.content().trim());
        watch.addReviewRating(request.rating());

        return ReviewResponse.fromEntity(reviewRepository.saveAndFlush(review));
    }

    @Transactional
    public ReviewResponse update(UUID watchId, UUID reviewId, UUID reviewerId, UpdateReviewRequest request) {
        var review = findReviewForWatch(watchId, reviewId);
        ensureOwner(review, reviewerId);

        var oldRating = review.getRating();
        review.update(request.rating(), request.content().trim());
        review.getWatch().updateReviewRating(oldRating, request.rating());

        return ReviewResponse.fromEntity(reviewRepository.saveAndFlush(review));
    }

    @Transactional
    public void delete(UUID watchId, UUID reviewId, UUID reviewerId) {
        var review = findReviewForWatch(watchId, reviewId);
        ensureOwner(review, reviewerId);

        review.getWatch().removeReviewRating(review.getRating());
        reviewRepository.delete(review);
    }

    @Transactional(readOnly = true)
    public Page<ReviewResponse> listByWatch(UUID watchId, Pageable pageable) {
        if (!watchRepository.existsById(watchId)) {
            throw new ResourceNotFoundException("Watch not found: " + watchId);
        }

        return reviewRepository.findByWatchId(watchId, pageable)
                .map(ReviewResponse::fromEntity);
    }

    private Review findReviewForWatch(UUID watchId, UUID reviewId) {
        return reviewRepository.findByIdAndWatchId(reviewId, watchId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
    }

    private void ensureOwner(Review review, UUID reviewerId) {
        if (!review.getReviewer().getId().equals(reviewerId)) {
            throw new AccessDeniedException("Review belongs to another user");
        }
    }
}
