package com.watchweb.app.domain.post.service;

import com.watchweb.app.domain.hashtag.service.HashtagService;
import com.watchweb.app.domain.hashtag.service.HashtagNameNormalizer;
import com.watchweb.app.domain.post.dto.CreatePostRequest;
import com.watchweb.app.domain.post.dto.PostImageResponse;
import com.watchweb.app.domain.post.dto.PostResponse;
import com.watchweb.app.domain.post.dto.SavePostDraftRequest;
import com.watchweb.app.domain.post.dto.UpdatePostRequest;
import com.watchweb.app.domain.post.entity.Post;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.repository.PostRepository;
import com.watchweb.app.exception.BadRequestException;
import com.watchweb.app.exception.InvalidOperationException;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.ResourceNotFoundException;
import com.watchweb.app.infrastructure.storage.StorageFolder;
import com.watchweb.app.infrastructure.storage.StorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final HashtagService hashtagService;
    private final HashtagNameNormalizer hashtagNameNormalizer;
    private final StorageService storageService;
    private final PostContentSanitizer contentSanitizer;

    public PostService(
            PostRepository postRepository,
            UserRepository userRepository,
            HashtagService hashtagService,
            HashtagNameNormalizer hashtagNameNormalizer,
            StorageService storageService,
            PostContentSanitizer contentSanitizer
    ) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.hashtagService = hashtagService;
        this.hashtagNameNormalizer = hashtagNameNormalizer;
        this.storageService = storageService;
        this.contentSanitizer = contentSanitizer;
    }

    @Transactional
    public PostResponse create(UUID authorId, CreatePostRequest request) {
        var author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        var post = new Post(author, request.title().trim(), sanitizeSubmittedContent(request.content()));
        post.replaceHashtags(hashtagService.resolve(request.hashtags()));
        return PostResponse.fromEntity(postRepository.saveAndFlush(post));
    }

    @Transactional
    public PostResponse createDraft(UUID authorId, SavePostDraftRequest request) {
        var author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        var post = new Post(
                author,
                request.title().trim(),
                contentSanitizer.sanitize(request.content()),
                PostStatus.DRAFT
        );
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
        if (post.isDraft()) {
            throw new InvalidOperationException("Draft must be updated through the draft endpoint");
        }

        post.updateByAuthor(request.title().trim(), sanitizeSubmittedContent(request.content()));
        post.replaceHashtags(hashtagService.resolve(request.hashtags()));
        return PostResponse.fromEntity(postRepository.saveAndFlush(post));
    }

    @Transactional
    public PostResponse updateDraft(UUID postId, UUID authorId, SavePostDraftRequest request) {
        var post = findExistingOwnPost(postId, authorId);
        if (!post.isDraft()) {
            throw new InvalidOperationException("Only a draft can be saved as a draft");
        }

        post.updateDraft(request.title().trim(), contentSanitizer.sanitize(request.content()));
        post.replaceHashtags(hashtagService.resolve(request.hashtags()));
        return PostResponse.fromEntity(postRepository.saveAndFlush(post));
    }

    @Transactional
    public PostResponse submitForModeration(UUID postId, UUID authorId, CreatePostRequest request) {
        var post = findExistingOwnPost(postId, authorId);
        if (!post.isDraft()) {
            throw new InvalidOperationException("Post is already submitted: " + postId);
        }

        post.submitForModeration(request.title().trim(), sanitizeSubmittedContent(request.content()));
        post.replaceHashtags(hashtagService.resolve(request.hashtags()));
        return PostResponse.fromEntity(postRepository.saveAndFlush(post));
    }

    @Transactional
    public PostResponse updateImage(UUID postId, UUID authorId, MultipartFile file) {
        var post = postRepository.findByIdAndDeletedAtIsNull(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        if (!post.getAuthor().getId().equals(authorId)) {
            throw new AccessDeniedException("Post belongs to another user");
        }

        var storedFile = storageService.store(file, StorageFolder.POST_IMAGES);
        post.updateImageByAuthor(storedFile.url());

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
        return searchApproved(null, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<PostResponse> searchApproved(String query, String hashtag, Pageable pageable) {
        var normalizedQuery = normalizeQuery(query);
        var normalizedHashtag = normalizeHashtag(hashtag);

        if (hashtag != null && normalizedHashtag == null) {
            return Page.empty(pageable);
        }

        return searchApprovedEntities(normalizedQuery, normalizedHashtag, pageable)
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

    @Transactional(readOnly = true)
    public PostResponse getMineById(UUID id, UUID authorId) {
        return PostResponse.fromEntity(findExistingOwnPost(id, authorId));
    }

    public PostImageResponse uploadContentImage(MultipartFile file) {
        var storedFile = storageService.store(file, StorageFolder.POST_IMAGES);
        return new PostImageResponse(storedFile.url());
    }

    private String normalizeQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        return query.trim();
    }

    private String normalizeHashtag(String hashtag) {
        if (hashtag == null || hashtag.isBlank()) {
            return null;
        }

        var normalized = hashtagNameNormalizer.normalize(hashtag);
        return normalized.isBlank() ? null : normalized;
    }

    private Page<Post> searchApprovedEntities(String query, String hashtag, Pageable pageable) {
        if (query == null && hashtag == null) {
            return postRepository.findByStatusAndDeletedAtIsNull(PostStatus.APPROVED, pageable);
        }
        if (query == null) {
            return postRepository.searchApprovedByHashtag(PostStatus.APPROVED, hashtag, pageable);
        }
        if (hashtag == null) {
            return postRepository.searchApprovedByText(PostStatus.APPROVED, query, pageable);
        }
        return postRepository.searchApprovedByTextAndHashtag(PostStatus.APPROVED, query, hashtag, pageable);
    }

    private String sanitizeSubmittedContent(String content) {
        var sanitizedContent = contentSanitizer.sanitize(content);
        if (!contentSanitizer.hasMeaningfulContent(sanitizedContent)) {
            throw new BadRequestException("Post content is required");
        }
        return sanitizedContent;
    }

    private Post findExistingOwnPost(UUID postId, UUID authorId) {
        var post = postRepository.findByIdAndDeletedAtIsNull(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found: " + postId));

        if (!post.getAuthor().getId().equals(authorId)) {
            throw new AccessDeniedException("Post belongs to another user");
        }
        return post;
    }
}
