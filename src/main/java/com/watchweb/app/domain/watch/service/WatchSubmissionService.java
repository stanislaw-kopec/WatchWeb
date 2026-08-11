package com.watchweb.app.domain.watch.service;

import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.domain.watch.dto.CreateWatchSubmissionRequest;
import com.watchweb.app.domain.watch.dto.WatchSubmissionResponse;
import com.watchweb.app.domain.watch.entity.WatchSubmission;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import com.watchweb.app.domain.watch.repository.WatchRepository;
import com.watchweb.app.domain.watch.repository.WatchSubmissionRepository;
import com.watchweb.app.exception.DuplicateResourceException;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class WatchSubmissionService {

    private static final String SUBMISSION_ACCEPTED_MESSAGE = "Dziekujemy, rozpatrzymy Twoje zgloszenie.";

    private final WatchSubmissionRepository watchSubmissionRepository;
    private final WatchRepository watchRepository;
    private final UserRepository userRepository;
    private final WatchNameNormalizer watchNameNormalizer;

    public WatchSubmissionService(
            WatchSubmissionRepository watchSubmissionRepository,
            WatchRepository watchRepository,
            UserRepository userRepository,
            WatchNameNormalizer watchNameNormalizer
    ) {
        this.watchSubmissionRepository = watchSubmissionRepository;
        this.watchRepository = watchRepository;
        this.userRepository = userRepository;
        this.watchNameNormalizer = watchNameNormalizer;
    }

    @Transactional
    public WatchSubmissionResponse submit(UUID submittedById, CreateWatchSubmissionRequest request) {
        var brand = request.brand().trim();
        var model = request.model().trim();
        var brandNormalized = watchNameNormalizer.normalize(brand);
        var modelNormalized = watchNameNormalizer.normalize(model);

        if (watchRepository.existsByBrandNormalizedAndModelNormalized(brandNormalized, modelNormalized)) {
            throw new DuplicateResourceException("Taki zegarek juz istnieje w katalogu.");
        }

        if (watchSubmissionRepository.existsByBrandNormalizedAndModelNormalizedAndStatus(
                brandNormalized,
                modelNormalized,
                WatchSubmissionStatus.PENDING
        )) {
            throw new DuplicateResourceException("Takie zgloszenie jest juz w trakcie rozpatrywania.");
        }

        var submittedBy = userRepository.findById(submittedById)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + submittedById));
        var details = request.details() == null ? null : request.details().toEntity();

        var submission = new WatchSubmission(
                submittedBy,
                brand,
                model,
                trimToNull(request.referenceCode()),
                brandNormalized,
                modelNormalized,
                details
        );

        return WatchSubmissionResponse.fromEntity(
                watchSubmissionRepository.saveAndFlush(submission),
                SUBMISSION_ACCEPTED_MESSAGE
        );
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
