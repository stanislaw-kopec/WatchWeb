package com.watchweb.app.domain.comment.service;

import com.watchweb.app.domain.comment.dto.CreateWatchCommentRequest;
import com.watchweb.app.domain.comment.dto.WatchCommentResponse;
import com.watchweb.app.domain.comment.entity.WatchComment;
import com.watchweb.app.domain.comment.repository.WatchCommentRepository;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.domain.watch.repository.WatchRepository;
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
public class WatchCommentService {

    private final WatchCommentRepository watchCommentRepository;
    private final WatchRepository watchRepository;
    private final UserRepository userRepository;

    public WatchCommentService(
            WatchCommentRepository watchCommentRepository,
            WatchRepository watchRepository,
            UserRepository userRepository
    ) {
        this.watchCommentRepository = watchCommentRepository;
        this.watchRepository = watchRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WatchCommentResponse create(UUID watchId, UUID authorId, CreateWatchCommentRequest request) {
        var watch = watchRepository.findById(watchId)
                .orElseThrow(() -> new ResourceNotFoundException("Watch not found: " + watchId));

        var author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        var parent = findParent(watchId, request.parentId());
        if (parent != null && parent.getDepth() >= WatchComment.MAX_DEPTH) {
            throw new BadRequestException("Maximum comment depth is 3");
        }

        var comment = new WatchComment(watch, author, parent, request.content().trim());
        return WatchCommentResponse.fromEntity(watchCommentRepository.saveAndFlush(comment), List.of());
    }

    @Transactional(readOnly = true)
    public List<WatchCommentResponse> listTree(UUID watchId) {
        if (!watchRepository.existsById(watchId)) {
            throw new ResourceNotFoundException("Watch not found: " + watchId);
        }

        var comments = watchCommentRepository.findByWatchIdOrderByCreatedAtAsc(watchId);
        var childrenByParentId = new LinkedHashMap<UUID, List<WatchComment>>();
        var roots = new ArrayList<WatchComment>();

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
    public void delete(UUID watchId, UUID commentId, UUID userId, boolean canDeleteAnyComment) {
        var comment = watchCommentRepository.findByIdAndWatchId(commentId, watchId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found: " + commentId));

        ensureOwnerOrModerator(comment, userId, canDeleteAnyComment);
        comment.softDelete();
    }

    private WatchComment findParent(UUID watchId, UUID parentId) {
        if (parentId == null) {
            return null;
        }

        return watchCommentRepository.findByIdAndWatchId(parentId, watchId)
                .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found: " + parentId));
    }

    private WatchCommentResponse toTree(WatchComment comment, LinkedHashMap<UUID, List<WatchComment>> childrenByParentId) {
        var children = childrenByParentId.getOrDefault(comment.getId(), List.of()).stream()
                .map(child -> toTree(child, childrenByParentId))
                .toList();

        return WatchCommentResponse.fromEntity(comment, children);
    }

    private void ensureOwnerOrModerator(WatchComment comment, UUID userId, boolean canDeleteAnyComment) {
        if (!canDeleteAnyComment && !comment.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("Comment belongs to another user");
        }
    }
}
