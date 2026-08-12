package com.watchweb.app.domain.article.service;

import com.watchweb.app.domain.article.dto.ArticleResponse;
import com.watchweb.app.domain.article.dto.CreateArticleRequest;
import com.watchweb.app.domain.article.dto.UpdateArticleRequest;
import com.watchweb.app.domain.article.entity.Article;
import com.watchweb.app.domain.article.repository.ArticleRepository;
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
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    public ArticleService(
            ArticleRepository articleRepository,
            UserRepository userRepository,
            StorageService storageService
    ) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    @Transactional
    public ArticleResponse create(UUID authorId, CreateArticleRequest request) {
        var author = userRepository.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + authorId));

        var article = new Article(author, request.title().trim(), request.content().trim());
        return ArticleResponse.fromEntity(articleRepository.saveAndFlush(article));
    }

    @Transactional(readOnly = true)
    public Page<ArticleResponse> list(Pageable pageable) {
        return articleRepository.findByDeletedAtIsNull(pageable)
                .map(ArticleResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public ArticleResponse getById(UUID id) {
        return findExisting(id);
    }

    @Transactional
    public ArticleResponse update(UUID articleId, UUID userId, boolean canManageAnyArticle, UpdateArticleRequest request) {
        var article = articleRepository.findByIdAndDeletedAtIsNull(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + articleId));

        ensureOwnerOrAdmin(article, userId, canManageAnyArticle);
        article.update(request.title().trim(), request.content().trim());

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

    private ArticleResponse findExisting(UUID id) {
        return articleRepository.findByIdAndDeletedAtIsNull(id)
                .map(ArticleResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
    }

    private void ensureOwnerOrAdmin(Article article, UUID userId, boolean canManageAnyArticle) {
        if (!canManageAnyArticle && !article.getAuthor().getId().equals(userId)) {
            throw new AccessDeniedException("Article belongs to another user");
        }
    }
}
