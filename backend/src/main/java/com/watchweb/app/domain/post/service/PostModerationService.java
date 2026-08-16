package com.watchweb.app.domain.post.service;

import com.watchweb.app.domain.post.dto.PostResponse;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.event.PostApprovedEvent;
import com.watchweb.app.domain.post.event.PostRejectedEvent;
import com.watchweb.app.domain.post.repository.PostRepository;
import com.watchweb.app.exception.InvalidOperationException;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PostModerationService {

    private final PostRepository postRepository;
    private final ApplicationEventPublisher eventPublisher;

    public PostModerationService(PostRepository postRepository, ApplicationEventPublisher eventPublisher) {
        this.postRepository = postRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> list(PostStatus status, Pageable pageable) {
        var posts = status == null
                ? postRepository.findByDeletedAtIsNull(pageable)
                : postRepository.findByStatusAndDeletedAtIsNull(status, pageable);

        return posts.map(PostResponse::fromEntity);
    }

    @Transactional
    public PostResponse approve(UUID postId) {
        var post = postRepository.findByIdAndDeletedAtIsNull(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        ensurePending(postId, post.isPending());
        post.approve();
        var savedPost = postRepository.saveAndFlush(post);
        eventPublisher.publishEvent(new PostApprovedEvent(
                savedPost.getId(),
                savedPost.getAuthor().getId(),
                savedPost.getTitle()
        ));

        return PostResponse.fromEntity(savedPost);
    }

    @Transactional
    public PostResponse reject(UUID postId, String reason) {
        var post = postRepository.findByIdAndDeletedAtIsNull(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        ensurePending(postId, post.isPending());
        var trimmedReason = reason.trim();
        post.reject(trimmedReason);
        var savedPost = postRepository.saveAndFlush(post);
        eventPublisher.publishEvent(new PostRejectedEvent(
                savedPost.getId(),
                savedPost.getAuthor().getId(),
                savedPost.getTitle(),
                trimmedReason
        ));

        return PostResponse.fromEntity(savedPost);
    }

    private void ensurePending(UUID postId, boolean pending) {
        if (!pending) {
            throw new InvalidOperationException("Post is not pending: " + postId);
        }
    }
}
