package com.watchweb.app.domain.post.service;

import com.watchweb.app.domain.post.dto.PostResponse;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.repository.PostRepository;
import com.watchweb.app.exception.InvalidOperationException;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PostModerationService {

    private final PostRepository postRepository;

    public PostModerationService(PostRepository postRepository) {
        this.postRepository = postRepository;
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

        return PostResponse.fromEntity(postRepository.saveAndFlush(post));
    }

    @Transactional
    public PostResponse reject(UUID postId, String reason) {
        var post = postRepository.findByIdAndDeletedAtIsNull(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        ensurePending(postId, post.isPending());
        post.reject(reason.trim());

        return PostResponse.fromEntity(postRepository.saveAndFlush(post));
    }

    private void ensurePending(UUID postId, boolean pending) {
        if (!pending) {
            throw new InvalidOperationException("Post is not pending: " + postId);
        }
    }
}
