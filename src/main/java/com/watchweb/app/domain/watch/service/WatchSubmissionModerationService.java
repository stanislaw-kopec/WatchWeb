package com.watchweb.app.domain.watch.service;

import com.watchweb.app.domain.watch.dto.ModerationWatchSubmissionResponse;
import com.watchweb.app.domain.watch.dto.WatchResponse;
import com.watchweb.app.domain.watch.dto.WatchSubmissionResponse;
import com.watchweb.app.domain.watch.entity.Watch;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import com.watchweb.app.domain.watch.event.WatchSubmissionApprovedEvent;
import com.watchweb.app.domain.watch.event.WatchSubmissionRejectedEvent;
import com.watchweb.app.domain.watch.repository.WatchRepository;
import com.watchweb.app.domain.watch.repository.WatchSubmissionRepository;
import com.watchweb.app.exception.DuplicateResourceException;
import com.watchweb.app.exception.InvalidOperationException;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class WatchSubmissionModerationService {

    private static final String SUBMISSION_REJECTED_MESSAGE = "Zgloszenie zostalo odrzucone.";

    private final WatchSubmissionRepository watchSubmissionRepository;
    private final WatchRepository watchRepository;
    private final ApplicationEventPublisher eventPublisher;

    public WatchSubmissionModerationService(
            WatchSubmissionRepository watchSubmissionRepository,
            WatchRepository watchRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.watchSubmissionRepository = watchSubmissionRepository;
        this.watchRepository = watchRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Page<ModerationWatchSubmissionResponse> list(WatchSubmissionStatus status, Pageable pageable) {
        var submissions = status == null
                ? watchSubmissionRepository.findAll(pageable)
                : watchSubmissionRepository.findByStatus(status, pageable);

        return submissions.map(ModerationWatchSubmissionResponse::fromEntity);
    }

    @Transactional
    public WatchResponse approve(UUID submissionId) {
        var submission = watchSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Watch submission not found: " + submissionId));

        ensurePending(submissionId, submission.isPending());

        if (watchRepository.existsByBrandNormalizedAndModelNormalized(
                submission.getBrandNormalized(),
                submission.getModelNormalized()
        )) {
            throw new DuplicateResourceException("Taki zegarek juz istnieje w katalogu.");
        }

        var watch = new Watch(
                submission.getBrand(),
                submission.getModel(),
                submission.getReferenceCode(),
                submission.getBrandNormalized(),
                submission.getModelNormalized(),
                submission.getDetails()
        );

        submission.approve();
        watchSubmissionRepository.saveAndFlush(submission);
        var savedWatch = watchRepository.saveAndFlush(watch);
        eventPublisher.publishEvent(new WatchSubmissionApprovedEvent(
                submission.getId(),
                submission.getSubmittedBy().getId(),
                savedWatch.getId(),
                submission.getBrand(),
                submission.getModel()
        ));

        return WatchResponse.fromEntity(savedWatch);
    }

    @Transactional
    public WatchSubmissionResponse reject(UUID submissionId, String reason) {
        var submission = watchSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Watch submission not found: " + submissionId));

        ensurePending(submissionId, submission.isPending());
        var trimmedReason = reason.trim();
        submission.reject(trimmedReason);
        var savedSubmission = watchSubmissionRepository.saveAndFlush(submission);
        eventPublisher.publishEvent(new WatchSubmissionRejectedEvent(
                savedSubmission.getId(),
                savedSubmission.getSubmittedBy().getId(),
                savedSubmission.getBrand(),
                savedSubmission.getModel(),
                trimmedReason
        ));

        return WatchSubmissionResponse.fromEntity(
                savedSubmission,
                SUBMISSION_REJECTED_MESSAGE
        );
    }

    private void ensurePending(UUID submissionId, boolean pending) {
        if (!pending) {
            throw new InvalidOperationException("Watch submission is not pending: " + submissionId);
        }
    }
}
