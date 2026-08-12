package com.watchweb.app.domain.notification.service;

import com.watchweb.app.domain.post.event.PostApprovedEvent;
import com.watchweb.app.domain.post.event.PostRejectedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class PostModerationNotificationListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(PostModerationNotificationListener.class);

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePostApproved(PostApprovedEvent event) {
        LOGGER.info("Post approved notification event received for post {} and author {}", event.postId(), event.authorId());
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePostRejected(PostRejectedEvent event) {
        LOGGER.info("Post rejected notification event received for post {} and author {}", event.postId(), event.authorId());
    }
}
