package com.watchweb.app.domain.notification.service;

import com.watchweb.app.domain.notification.dto.NotificationResponse;
import com.watchweb.app.domain.notification.entity.Notification;
import com.watchweb.app.domain.notification.entity.NotificationType;
import com.watchweb.app.domain.notification.repository.NotificationRepository;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> list(UUID recipientId, Pageable pageable) {
        return notificationRepository.findByRecipientId(recipientId, pageable)
                .map(NotificationResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public long countUnread(UUID recipientId) {
        return notificationRepository.countByRecipientIdAndReadAtIsNull(recipientId);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId, UUID recipientId) {
        var notification = notificationRepository.findByIdAndRecipientId(notificationId, recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        notification.markAsRead();
        return NotificationResponse.fromEntity(notificationRepository.saveAndFlush(notification));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public NotificationResponse create(UUID recipientId, NotificationType type, String message, UUID targetId) {
        var recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + recipientId));

        var notification = new Notification(recipient, type, message, targetId);
        return NotificationResponse.fromEntity(notificationRepository.saveAndFlush(notification));
    }
}
