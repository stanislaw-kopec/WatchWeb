package com.watchweb.app.domain.article.service;

import com.watchweb.app.domain.article.dto.ArticleResponse;
import com.watchweb.app.domain.article.dto.ArticleImageResponse;
import com.watchweb.app.domain.article.dto.CreateArticleRequest;
import com.watchweb.app.domain.article.dto.SaveArticleDraftRequest;
import com.watchweb.app.domain.article.dto.UpdateArticleRequest;
import com.watchweb.app.domain.article.entity.Article;
import com.watchweb.app.domain.article.entity.ArticleStatus;
import com.watchweb.app.domain.article.repository.ArticleRepository;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.BadRequestException;
import com.watchweb.app.exception.InvalidOperationException;
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
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;
    private final ArticleContentSanitizer contentSanitizer;

    public ArticleService(
            ArticleRepository articleRepository,
            UserRepository userRepository,
            StorageService storageService,
            ArticleContentSanitizer contentSanitizer
    ) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
        this.contentSanitizer = contentSanitizer;
    }

    @Transactional
    public ArticleResponse create(UUID authorId, CreateArticleRequest request) {
        var author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        var sanitizedContent = sanitizePublishedContent(request.content());
        var article = new Article(author, request.title().trim(), sanitizedContent, ArticleStatus.PUBLISHED);
        return ArticleResponse.fromEntity(articleRepository.saveAndFlush(article));
    }

    @Transactional
    public ArticleResponse createDraft(UUID authorId, SaveArticleDraftRequest request) {
        var author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        var article = new Article(
                author,
                request.title().trim(),
                contentSanitizer.sanitize(request.content()),
                ArticleStatus.DRAFT
        );
        return ArticleResponse.fromEntity(articleRepository.saveAndFlush(article));
    }

    @Transactional(readOnly = true)
    public Page<ArticleResponse> list(Pageable pageable) {
        return search(null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<ArticleResponse> search(String query, Pageable pageable) {
        var normalizedQuery = normalizeQuery(query);

        if (normalizedQuery == null) {
            return articleRepository.findByStatusAndDeletedAtIsNull(ArticleStatus.PUBLISHED, pageable)
                    .map(ArticleResponse::fromEntity);
        }

        return articleRepository.searchByText(ArticleStatus.PUBLISHED, normalizedQuery, pageable)
                .map(ArticleResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ArticleResponse> listMine(UUID authorId, ArticleStatus status, Pageable pageable) {
        if (status == null) {
            return articleRepository.findByAuthorIdAndDeletedAtIsNull(authorId, pageable)
                    .map(ArticleResponse::fromEntity);
        }

        return articleRepository.findByAuthorIdAndStatusAndDeletedAtIsNull(authorId, status, pageable)
                .map(ArticleResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ArticleResponse getById(UUID id) {
        return articleRepository.findByIdAndStatusAndDeletedAtIsNull(id, ArticleStatus.PUBLISHED)
                .map(ArticleResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
    }

    @Transactional(readOnly = true)
    public ArticleResponse getMineById(UUID id, UUID userId, boolean canManageAnyArticle) {
        var article = findExistingEntity(id);
        ensureOwnerOrAdmin(article, userId, canManageAnyArticle);
        return ArticleResponse.fromEntity(article);
    }

    @Transactional
    public ArticleResponse update(UUID articleId, UUID userId, boolean canManageAnyArticle, UpdateArticleRequest request) {
        var article = articleRepository.findByIdAndDeletedAtIsNull(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + articleId));

        ensureOwnerOrAdmin(article, userId, canManageAnyArticle);
        if (article.isDraft()) {
            throw new InvalidOperationException("Draft must be updated through the draft endpoint");
        }
        article.update(request.title().trim(), sanitizePublishedContent(request.content()));

        return ArticleResponse.fromEntity(articleRepository.saveAndFlush(article));
    }

    @Transactional
    public ArticleResponse updateDraft(
            UUID articleId,
            UUID userId,
            boolean canManageAnyArticle,
            SaveArticleDraftRequest request
    ) {
        var article = findExistingEntity(articleId);
        ensureOwnerOrAdmin(article, userId, canManageAnyArticle);
        if (!article.isDraft()) {
            throw new InvalidOperationException("Only a draft can be saved as a draft");
        }

        article.updateDraft(request.title().trim(), contentSanitizer.sanitize(request.content()));
        return ArticleResponse.fromEntity(articleRepository.saveAndFlush(article));
    }

    @Transactional
    public ArticleResponse publish(
            UUID articleId,
            UUID userId,
            boolean canManageAnyArticle,
            CreateArticleRequest request
    ) {
        var article = findExistingEntity(articleId);
        ensureOwnerOrAdmin(article, userId, canManageAnyArticle);
        if (!article.isDraft()) {
            throw new InvalidOperationException("Article is already published");
        }

        article.publish(request.title().trim(), sanitizePublishedContent(request.content()));
        return ArticleResponse.fromEntity(articleRepository.saveAndFlush(article));
    }

    @Transactional
    public ArticleResponse updateHeaderImage(UUID articleId, UUID userId, boolean canManageAnyArticle, MultipartFile file) {
        var article = articleRepository.findByIdAndDeletedAtIsNull(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + articleId));

        ensureOwnerOrAdmin(article, userId, canManageAnyArticle);

        var storedFile = storageService.store(file, StorageFolder.ARTICLE_IMAGES);
        article.updateHeaderImageUrl(storedFile.url());

        return ArticleResponse.fromEntity(articleRepository.saveAndFlush(article));
    }

    @Transactional
    public void delete(UUID articleId, UUID userId, boolean canManageAnyArticle) {
        var article = articleRepository.findByIdAndDeletedAtIsNull(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + articleId));

        ensureOwnerOrAdmin(article, userId, canManageAnyArticle);
        article.softDelete();
        articleRepository.saveAndFlush(article);
    }

    public ArticleImageResponse uploadContentImage(MultipartFile file) {
        var storedFile = storageService.store(file, StorageFolder.ARTICLE_IMAGES);
        return new ArticleImageResponse(storedFile.url());
    }

    private Article findExistingEntity(UUID id) {
        return articleRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
    }

    private String sanitizePublishedContent(String content) {
        var sanitizedContent = contentSanitizer.sanitize(content);
        if (!contentSanitizer.hasMeaningfulContent(sanitizedContent)) {
            throw new BadRequestException("Article content is required");
        }
        return sanitizedContent;
    }

    private void ensureOwnerOrAdmin(Article article, UUID userId, boolean canManageAnyArticle) {
        if (!canManageAnyArticle && !article.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("Article belongs to another user");
        }
    }

    private String normalizeQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        return query.trim();
    }
}
