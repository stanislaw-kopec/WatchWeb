package com.watchweb.app.domain.notification.service;

import com.watchweb.app.domain.notification.entity.NotificationType;
import com.watchweb.app.domain.post.event.PostApprovedEvent;
import com.watchweb.app.domain.post.event.PostRejectedEvent;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class PostModerationNotificationListener {

    private final NotificationService notificationService;

    public PostModerationNotificationListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePostApproved(PostApprovedEvent event) {
        notificationService.create(
                event.authorId(),
                NotificationType.POST_APPROVED,
                "Post approved: " + event.title(),
                event.postId()
        );
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePostRejected(PostRejectedEvent event) {
        notificationService.create(
                event.authorId(),
                NotificationType.POST_REJECTED,
                "Post rejected: " + event.title() + ". Reason: " + event.reason(),
                event.postId()
        );
    }
}
