package com.watchweb.app.domain.notification.service;

import com.watchweb.app.domain.notification.entity.NotificationType;
import com.watchweb.app.domain.watch.event.WatchSubmissionApprovedEvent;
import com.watchweb.app.domain.watch.event.WatchSubmissionRejectedEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class WatchSubmissionNotificationListener {

    private final NotificationService notificationService;

    public WatchSubmissionNotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleWatchSubmissionApproved(WatchSubmissionApprovedEvent event) {
        notificationService.create(
                event.submittedById(),
                NotificationType.WATCH_SUBMISSION_APPROVED,
                "Watch submission approved: " + event.brand() + " " + event.model(),
                event.watchId()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleWatchSubmissionRejected(WatchSubmissionRejectedEvent event) {
        notificationService.create(
                event.submittedById(),
                NotificationType.WATCH_SUBMISSION_REJECTED,
                "Watch submission rejected: " + event.brand() + " " + event.model() + ". Reason: " + event.reason(),
                event.submissionId()
        );
    }
}
