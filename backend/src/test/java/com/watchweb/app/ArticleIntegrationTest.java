package com.watchweb.app;
import com.watchweb.app.domain.article.dto.CreateArticleRequest;
import com.watchweb.app.domain.article.dto.UpdateArticleRequest;
import com.watchweb.app.domain.article.repository.ArticleRepository;
import com.watchweb.app.domain.article.service.ArticleService;
import com.watchweb.app.domain.auth.dto.RegisterRequest;
import com.watchweb.app.domain.auth.dto.LoginRequest;
import com.watchweb.app.domain.auth.dto.LogoutRequest;
import com.watchweb.app.domain.auth.dto.RefreshTokenRequest;
import com.watchweb.app.domain.auth.service.AuthService;
import com.watchweb.app.domain.comment.dto.CreatePostCommentRequest;
import com.watchweb.app.domain.comment.dto.CreateWatchCommentRequest;
import com.watchweb.app.domain.comment.service.PostCommentService;
import com.watchweb.app.domain.comment.service.WatchCommentService;
import com.watchweb.app.domain.hashtag.service.HashtagService;
import com.watchweb.app.domain.notification.entity.NotificationType;
import com.watchweb.app.domain.notification.service.NotificationService;
import com.watchweb.app.domain.post.dto.CreatePostRequest;
import com.watchweb.app.domain.post.dto.UpdatePostRequest;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.event.PostApprovedEvent;
import com.watchweb.app.domain.post.event.PostRejectedEvent;
import com.watchweb.app.domain.post.repository.PostRepository;
import com.watchweb.app.domain.post.service.PostModerationService;
import com.watchweb.app.domain.post.service.PostService;
import com.watchweb.app.domain.review.dto.CreateReviewRequest;
import com.watchweb.app.domain.review.dto.UpdateReviewRequest;
import com.watchweb.app.domain.review.service.ReviewService;
import com.watchweb.app.domain.user.dto.UpdatePasswordRequest;
import com.watchweb.app.domain.user.dto.UpdateUserProfileRequest;
import com.watchweb.app.domain.user.dto.UpdateUserRoleRequest;
import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.entity.User;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.domain.user.service.UserAdminService;
import com.watchweb.app.domain.user.service.UserService;
import com.watchweb.app.domain.watch.dto.CreateWatchSubmissionRequest;
import com.watchweb.app.domain.watch.dto.WatchDetailsRequest;
import com.watchweb.app.domain.watch.entity.MovementType;
import com.watchweb.app.domain.watch.entity.Watch;
import com.watchweb.app.domain.watch.entity.WatchDetails;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import com.watchweb.app.domain.watch.repository.WatchRepository;
import com.watchweb.app.domain.watch.repository.WatchSubmissionRepository;
import com.watchweb.app.domain.watch.service.WatchNameNormalizer;
import com.watchweb.app.domain.watch.service.WatchCatalogService;
import com.watchweb.app.domain.watch.service.WatchSubmissionModerationService;
import com.watchweb.app.domain.watch.service.WatchSubmissionService;
import com.watchweb.app.exception.BadRequestException;
import com.watchweb.app.exception.DuplicateResourceException;
import com.watchweb.app.exception.InvalidCredentialsException;
import com.watchweb.app.exception.InvalidOperationException;
import com.watchweb.app.exception.ResourceNotFoundException;
import com.watchweb.app.infrastructure.storage.StorageFolder;
import com.watchweb.app.infrastructure.storage.StorageService;
import com.watchweb.app.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
class ArticleIntegrationTest extends AbstractIntegrationTest {
    @Test
    void journalistCreatesArticle() {
        var journalist = userRepository.saveAndFlush(new User(
                "articlejournalist",
                "articlejournalist@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));

        var response = articleService.create(
                journalist.getId(),
                new CreateArticleRequest("Microbrand guide", "Microbrands changed the way collectors discover new watches.")
        );

        assertThat(response.id()).isNotNull();
        assertThat(response.authorId()).isEqualTo(journalist.getId());
        assertThat(response.title()).isEqualTo("Microbrand guide");
        assertThat(articleRepository.findById(response.id()).orElseThrow().getDeletedAt()).isNull();
    }

    @Test
    void listsAndReturnsArticleById() {
        var journalist = userRepository.saveAndFlush(new User(
                "articlelistjournalist",
                "articlelistjournalist@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var article = articleService.create(
                journalist.getId(),
                new CreateArticleRequest("Public article", "This article should be visible.")
        );

        var page = articleService.list(PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")));
        var details = articleService.getById(article.id());

        assertThat(page.getContent())
                .anySatisfy(response -> assertThat(response.id()).isEqualTo(article.id()));
        assertThat(details.title()).isEqualTo("Public article");
    }

    @Test
    void searchesArticlesByTitleOrContent() {
        var journalist = userRepository.saveAndFlush(new User(
                "articlesearchjournalist",
                "articlesearchjournalist@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var matchingArticle = articleService.create(
                journalist.getId(),
                new CreateArticleRequest("Meteorite dials", "A guide to unusual watch materials.")
        );
        var otherArticle = articleService.create(
                journalist.getId(),
                new CreateArticleRequest("Dive watches", "Water resistance and bezels.")
        );

        var page = articleService.search("meteorite", PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")));

        assertThat(page.getContent())
                .singleElement()
                .satisfies(article -> assertThat(article.id()).isEqualTo(matchingArticle.id()));
        assertThat(page.getContent())
                .noneSatisfy(article -> assertThat(article.id()).isEqualTo(otherArticle.id()));
    }

    @Test
    void authorUpdatesOwnArticle() {
        var journalist = userRepository.saveAndFlush(new User(
                "articleupdateauthor",
                "articleupdateauthor@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var article = articleService.create(
                journalist.getId(),
                new CreateArticleRequest("Original article", "Original content.")
        );

        var response = articleService.update(
                article.id(),
                journalist.getId(),
                false,
                new UpdateArticleRequest("Updated article", "Updated content.")
        );

        assertThat(response.title()).isEqualTo("Updated article");
        assertThat(response.content()).isEqualTo("Updated content.");
    }

    @Test
    void rejectsUpdatingArticleOwnedByAnotherJournalist() {
        var owner = userRepository.saveAndFlush(new User(
                "articleowner",
                "articleowner@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var otherJournalist = userRepository.saveAndFlush(new User(
                "articleother",
                "articleother@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var article = articleService.create(
                owner.getId(),
                new CreateArticleRequest("Owner article", "Only owner can update this.")
        );

        assertThatThrownBy(() -> articleService.update(
                article.id(),
                otherJournalist.getId(),
                false,
                new UpdateArticleRequest("Intruder title", "Intruder content.")
        ))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Article belongs to another user");
    }

    @Test
    void adminUpdatesArticleOwnedByJournalist() {
        var journalist = userRepository.saveAndFlush(new User(
                "articleadminowner",
                "articleadminowner@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var admin = userRepository.saveAndFlush(new User(
                "articleadmin",
                "articleadmin@example.com",
                "{bcrypt}hash",
                Role.ROLE_ADMIN
        ));
        var article = articleService.create(
                journalist.getId(),
                new CreateArticleRequest("Admin editable", "Admin can update this.")
        );

        var response = articleService.update(
                article.id(),
                admin.getId(),
                true,
                new UpdateArticleRequest("Admin updated", "Updated by admin.")
        );

        assertThat(response.title()).isEqualTo("Admin updated");
    }

    @Test
    void authorUpdatesArticleHeaderImage() throws Exception {
        var journalist = userRepository.saveAndFlush(new User(
                "articleimageauthor",
                "articleimageauthor@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var article = articleService.create(
                journalist.getId(),
                new CreateArticleRequest("Image article", "This article needs a header image.")
        );
        var file = new MockMultipartFile(
                "file",
                "header.webp",
                "image/webp",
                "header-image-content".getBytes(StandardCharsets.UTF_8)
        );

        var response = articleService.updateHeaderImage(article.id(), journalist.getId(), false, file);

        assertThat(response.headerImageUrl()).startsWith("/api/files/article-images/");
        assertThat(response.headerImageUrl()).endsWith(".webp");

        var filename = response.headerImageUrl().substring(response.headerImageUrl().lastIndexOf('/') + 1);
        var resource = storageService.load("article-images", filename);
        assertThat(resource.getInputStream().readAllBytes()).isEqualTo("header-image-content".getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void rejectsUpdatingArticleHeaderImageOwnedByAnotherJournalist() {
        var owner = userRepository.saveAndFlush(new User(
                "articleimageowner",
                "articleimageowner@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var otherJournalist = userRepository.saveAndFlush(new User(
                "articleimageother",
                "articleimageother@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var article = articleService.create(
                owner.getId(),
                new CreateArticleRequest("Owner image article", "Only owner can set the image.")
        );
        var file = new MockMultipartFile(
                "file",
                "header.jpg",
                "image/jpeg",
                "header-image-content".getBytes(StandardCharsets.UTF_8)
        );

        assertThatThrownBy(() -> articleService.updateHeaderImage(article.id(), otherJournalist.getId(), false, file))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Article belongs to another user");
    }

    @Test
    void adminUpdatesArticleHeaderImageOwnedByJournalist() {
        var journalist = userRepository.saveAndFlush(new User(
                "articleimageadminowner",
                "articleimageadminowner@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var admin = userRepository.saveAndFlush(new User(
                "articleimageadmin",
                "articleimageadmin@example.com",
                "{bcrypt}hash",
                Role.ROLE_ADMIN
        ));
        var article = articleService.create(
                journalist.getId(),
                new CreateArticleRequest("Admin image article", "Admin can set the image.")
        );
        var file = new MockMultipartFile(
                "file",
                "header.png",
                "image/png",
                "header-image-content".getBytes(StandardCharsets.UTF_8)
        );

        var response = articleService.updateHeaderImage(article.id(), admin.getId(), true, file);

        assertThat(response.headerImageUrl()).startsWith("/api/files/article-images/");
        assertThat(response.headerImageUrl()).endsWith(".png");
    }

    @Test
    void softDeletesArticleAndHidesItFromPublicReads() {
        var journalist = userRepository.saveAndFlush(new User(
                "articledeleteauthor",
                "articledeleteauthor@example.com",
                "{bcrypt}hash",
                Role.ROLE_JOURNALIST
        ));
        var article = articleService.create(
                journalist.getId(),
                new CreateArticleRequest("Deleted article", "This should be hidden.")
        );

        articleService.delete(article.id(), journalist.getId(), false);

        assertThat(articleRepository.findById(article.id()).orElseThrow().getDeletedAt()).isNotNull();
        assertThatThrownBy(() -> articleService.getById(article.id()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Article not found: " + article.id());
        assertThat(articleService.list(PageRequest.of(0, 20)).getContent())
                .noneSatisfy(response -> assertThat(response.id()).isEqualTo(article.id()));
    }
}
