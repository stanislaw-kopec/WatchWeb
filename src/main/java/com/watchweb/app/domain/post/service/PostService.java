package com.watchweb.app.domain.post.service;

import com.watchweb.app.domain.hashtag.service.HashtagService;
import com.watchweb.app.domain.post.dto.CreatePostRequest;
import com.watchweb.app.domain.post.dto.PostResponse;
import com.watchweb.app.domain.post.dto.UpdatePostRequest;
import com.watchweb.app.domain.post.entity.Post;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.repository.PostRepository;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final HashtagService hashtagService;

    public PostService(PostRepository postRepository, UserRepository userRepository, HashtagService hashtagService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.hashtagService = hashtagService;
    }

    @Transactional
    public PostResponse create(UUID authorId, CreatePostRequest request) {
        var author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        var post = new Post(author, request.title().trim(), request.content().trim());
        post.replaceHashtags(hashtagService.resolve(request.hashtags()));
        return PostResponse.fromEntity(postRepository.saveAndFlush(post));
    }

    @Transactional
    public PostResponse update(UUID postId, UUID authorId, UpdatePostRequest request) {
        var post = postRepository.findByIdAndDeletedAtIsNull(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        if (!post.getAuthor().getId().equals(authorId)) {
            throw new AccessDeniedException("Post belongs to another user");
        }

        post.updateByAuthor(request.title().trim(), request.content().trim());
        post.replaceHashtags(hashtagService.resolve(request.hashtags()));
        return PostResponse.fromEntity(postRepository.saveAndFlush(post));
    }

    @Transactional
    public void delete(UUID postId, UUID authorId) {
        var post = postRepository.findByIdAndDeletedAtIsNull(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        if (!post.getAuthor().getId().equals(authorId)) {
            throw new AccessDeniedException("Post belongs to another user");
        }

        post.softDelete();
        postRepository.saveAndFlush(post);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listApproved(Pageable pageable) {
        return postRepository.findByStatusAndDeletedAtIsNull(PostStatus.APPROVED, pageable)
                .map(PostResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> listMine(UUID authorId, PostStatus status, Pageable pageable) {
        if (status == null) {
            return postRepository.findByAuthorIdAndDeletedAtIsNull(authorId, pageable)
                    .map(PostResponse::fromEntity);
        }

        return postRepository.findByAuthorIdAndStatusAndDeletedAtIsNull(authorId, status, pageable)
                .map(PostResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public PostResponse getApprovedById(UUID id) {
        return postRepository.findByIdAndStatusAndDeletedAtIsNull(id, PostStatus.APPROVED)
                .map(PostResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + id));
    }
}
