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
class WatchCatalogIntegrationTest extends AbstractIntegrationTest {
    @Test
    void submitsWatchForModeratorReview() {
        var user = authService.register(new RegisterRequest("watchsubmitter", "watchsubmitter@example.com", "StrongPassword123"));
        var request = createWatchSubmissionRequest("Orient", "Bambino");

        var response = watchSubmissionService.submit(user.user().id(), request);

        assertThat(response.id()).isNotNull();
        assertThat(response.status()).isEqualTo(WatchSubmissionStatus.PENDING);
        assertThat(response.message()).isEqualTo("Dziekujemy, rozpatrzymy Twoje zgloszenie.");
        assertThat(watchSubmissionRepository.existsByBrandNormalizedAndModelNormalizedAndStatus(
                "orient",
                "bambino",
                WatchSubmissionStatus.PENDING
        )).isTrue();
    }

    @Test
    void rejectsDuplicatePendingWatchSubmission() {
        var user = authService.register(new RegisterRequest("duplicatepending", "duplicatepending@example.com", "StrongPassword123"));
        watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("Seiko", "SKX007"));

        assertThatThrownBy(() -> watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("seiko", "skx 007")))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Takie zgloszenie jest juz w trakcie rozpatrywania.");
    }

    @Test
    void rejectsSubmissionWhenWatchAlreadyExistsInCatalog() {
        var user = authService.register(new RegisterRequest("existingwatch", "existingwatch@example.com", "StrongPassword123"));
        var brand = "Casio";
        var model = "F-91W";
        watchRepository.saveAndFlush(new Watch(
                brand,
                model,
                "F-91W-1",
                watchNameNormalizer.normalize(brand),
                watchNameNormalizer.normalize(model),
                new WatchDetails(MovementType.QUARTZ, null, null, null, null, null, 30, "Resin glass", "Resin")
        ));

        assertThatThrownBy(() -> watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("casio", "f 91w")))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Taki zegarek juz istnieje w katalogu.");
    }

    @Test
    void listsCatalogWatches() {
        var savedWatch = saveCatalogWatch("Omega", "Speedmaster");

        var page = watchCatalogService.list(
                null,
                null,
                null,
                null,
                null,
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        assertThat(page.getContent())
                .anySatisfy(watch -> {
                    assertThat(watch.id()).isEqualTo(savedWatch.getId());
                    assertThat(watch.brand()).isEqualTo("Omega");
                    assertThat(watch.model()).isEqualTo("Speedmaster");
                });
    }

    @Test
    void filtersCatalogWatches() {
        var matchingWatch = saveCatalogWatch(
                "Seiko",
                "Prospex",
                MovementType.AUTOMATIC,
                BigDecimal.valueOf(40.50),
                200
        );
        saveCatalogWatch("Seiko", "Quartz Diver", MovementType.QUARTZ, BigDecimal.valueOf(40.00), 200);
        saveCatalogWatch("Omega", "Seamaster", MovementType.AUTOMATIC, BigDecimal.valueOf(42.00), 300);
        saveCatalogWatch("Seiko", "Small Automatic", MovementType.AUTOMATIC, BigDecimal.valueOf(36.00), 100);

        var page = watchCatalogService.list(
                "seiko",
                MovementType.AUTOMATIC,
                BigDecimal.valueOf(39.00),
                BigDecimal.valueOf(41.00),
                150,
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        assertThat(page.getContent())
                .singleElement()
                .satisfies(watch -> assertThat(watch.id()).isEqualTo(matchingWatch.getId()));
    }

    @Test
    void rejectsInvalidCatalogDiameterRange() {
        assertThatThrownBy(() -> watchCatalogService.list(
                null,
                null,
                BigDecimal.valueOf(42.00),
                BigDecimal.valueOf(38.00),
                null,
                PageRequest.of(0, 10)
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Minimum case diameter cannot be greater than maximum case diameter");
    }

    @Test
    void returnsCatalogWatchById() {
        var savedWatch = saveCatalogWatch("Nomos", "Tangente");

        var response = watchCatalogService.getById(savedWatch.getId());

        assertThat(response.id()).isEqualTo(savedWatch.getId());
        assertThat(response.brand()).isEqualTo("Nomos");
        assertThat(response.model()).isEqualTo("Tangente");
    }

    @Test
    void rejectsUnknownCatalogWatchId() {
        var id = UUID.randomUUID();

        assertThatThrownBy(() -> watchCatalogService.getById(id))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Watch not found: " + id);
    }
}
