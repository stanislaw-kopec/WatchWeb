package com.watchweb.app.domain.comment.service;

import com.watchweb.app.domain.comment.dto.CreatePostCommentRequest;
import com.watchweb.app.domain.comment.dto.PostCommentResponse;
import com.watchweb.app.domain.comment.entity.PostComment;
import com.watchweb.app.domain.comment.repository.PostCommentRepository;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.repository.PostRepository;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.BadRequestException;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.UUID;

@Service
public class PostCommentService {

    private final PostCommentRepository postCommentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostCommentService(
            PostCommentRepository postCommentRepository,
            PostRepository postRepository,
            UserRepository userRepository
    ) {
        this.postCommentRepository = postCommentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PostCommentResponse create(UUID postId, UUID authorId, CreatePostCommentRequest request) {
        var post = postRepository.findByIdAndStatusAndDeletedAtIsNull(postId, PostStatus.APPROVED)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        var author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        var parent = findParent(postId, request.parentId());
        if (parent != null && parent.getDepth() >= PostComment.MAX_DEPTH) {
            throw new BadRequestException("Maximum comment depth is 3");
        }

        var comment = new PostComment(post, author, parent, request.content().trim());
        return PostCommentResponse.fromEntity(postCommentRepository.saveAndFlush(comment), List.of());
    }

    @Transactional(readOnly = true)
    public List<PostCommentResponse> listTree(UUID postId) {
        if (postRepository.findByIdAndStatusAndDeletedAtIsNull(postId, PostStatus.APPROVED).isEmpty()) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }

        var comments = postCommentRepository.findByPostIdOrderByCreatedAtAsc(postId);
        var childrenByParentId = new LinkedHashMap<UUID, List<PostComment>>();
        var roots = new ArrayList<PostComment>();

        for (var comment : comments) {
            if (comment.getParent() == null) {
                roots.add(comment);
            } else {
                childrenByParentId.computeIfAbsent(comment.getParent().getId(), ignored -> new ArrayList<>())
                        .add(comment);
            }
        }

        return roots.stream()
                .map(root -> toTree(root, childrenByParentId))
                .toList();
    }

    @Transactional
    public void delete(UUID postId, UUID commentId, UUID userId, boolean canDeleteAnyComment) {
        if (postRepository.findByIdAndStatusAndDeletedAtIsNull(postId, PostStatus.APPROVED).isEmpty()) {
            throw new ResourceNotFoundException("Post not found: " + postId);
        }

        var comment = postCommentRepository.findByIdAndPostId(commentId, postId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        ensureOwnerOrModerator(comment, userId, canDeleteAnyComment);
        comment.softDelete();
    }

    private PostComment findParent(UUID postId, UUID parentId) {
        if (parentId == null) {
            return null;
        }

        return postCommentRepository.findByIdAndPostId(parentId, postId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found: " + parentId));
    }

    private PostCommentResponse toTree(PostComment comment, LinkedHashMap<UUID, List<PostComment>> childrenByParentId) {
        var children = childrenByParentId.getOrDefault(comment.getId(), List.of()).stream()
                .map(child -> toTree(child, childrenByParentId))
                .toList();

        return PostCommentResponse.fromEntity(comment, children);
    }

    private void ensureOwnerOrModerator(PostComment comment, UUID userId, boolean canDeleteAnyComment) {
        if (!canDeleteAnyComment && !comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("Comment belongs to another user");
        }
    }
}
