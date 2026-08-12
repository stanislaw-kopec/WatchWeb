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
class WatchSubmissionModerationIntegrationTest extends AbstractIntegrationTest {
    @Test
    void approvesWatchSubmissionAndCreatesCatalogWatch() {
        var user = authService.register(new RegisterRequest("approvesubmission", "approvesubmission@example.com", "StrongPassword123"));
        var submission = watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("Tissot", "PRX"));

        var watch = watchSubmissionModerationService.approve(submission.id());

        assertThat(watch.id()).isNotNull();
        assertThat(watch.brand()).isEqualTo("Tissot");
        assertThat(watch.model()).isEqualTo("PRX");
        assertThat(watchRepository.existsByBrandNormalizedAndModelNormalized("tissot", "prx")).isTrue();
        assertThat(watchSubmissionRepository.findById(submission.id()).orElseThrow().getStatus())
                .isEqualTo(WatchSubmissionStatus.APPROVED);
    }

    @Test
    void createsNotificationWhenWatchSubmissionIsApproved() {
        var user = authService.register(new RegisterRequest("watchapprovednotification", "watchapprovednotification@example.com", "StrongPassword123"));
        var submission = watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("Sinn", "U50"));

        var watch = watchSubmissionModerationService.approve(submission.id());

        var page = notificationService.list(user.user().id(), PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")));
        assertThat(page.getContent())
                .anySatisfy(notification -> {
                    assertThat(notification.type()).isEqualTo(NotificationType.WATCH_SUBMISSION_APPROVED);
                    assertThat(notification.message()).isEqualTo("Watch submission approved: Sinn U50");
                    assertThat(notification.targetId()).isEqualTo(watch.id());
                    assertThat(notification.read()).isFalse();
                });
    }

    @Test
    void rejectsWatchSubmissionWithReason() {
        var user = authService.register(new RegisterRequest("rejectsubmission", "rejectsubmission@example.com", "StrongPassword123"));
        var submission = watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("Citizen", "Tsuyosa"));

        var response = watchSubmissionModerationService.reject(submission.id(), "Duplicate-like model");

        assertThat(response.status()).isEqualTo(WatchSubmissionStatus.REJECTED);
        assertThat(response.message()).isEqualTo("Zgloszenie zostalo odrzucone.");
        var rejectedSubmission = watchSubmissionRepository.findById(submission.id()).orElseThrow();
        assertThat(rejectedSubmission.getRejectionReason()).isEqualTo("Duplicate-like model");
    }

    @Test
    void createsNotificationWhenWatchSubmissionIsRejected() {
        var user = authService.register(new RegisterRequest("watchrejectednotification", "watchrejectednotification@example.com", "StrongPassword123"));
        var submission = watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("Formex", "Essence"));

        watchSubmissionModerationService.reject(submission.id(), "Missing reference details");

        var page = notificationService.list(user.user().id(), PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")));
        assertThat(page.getContent())
                .anySatisfy(notification -> {
                    assertThat(notification.type()).isEqualTo(NotificationType.WATCH_SUBMISSION_REJECTED);
                    assertThat(notification.message()).isEqualTo("Watch submission rejected: Formex Essence. Reason: Missing reference details");
                    assertThat(notification.targetId()).isEqualTo(submission.id());
                    assertThat(notification.read()).isFalse();
                });
    }

    @Test
    void listsWatchSubmissionsForModerationByStatus() {
        var user = authService.register(new RegisterRequest("listsubmissions", "listsubmissions@example.com", "StrongPassword123"));
        var pendingSubmission = watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("Longines", "Spirit"));
        var rejectedSubmission = watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("Certina", "DS Action"));
        watchSubmissionModerationService.reject(rejectedSubmission.id(), "Missing reference details");

        var page = watchSubmissionModerationService.list(
                WatchSubmissionStatus.PENDING,
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        assertThat(page.getContent())
                .allSatisfy(submission -> assertThat(submission.status()).isEqualTo(WatchSubmissionStatus.PENDING))
                .anySatisfy(submission -> {
                    assertThat(submission.id()).isEqualTo(pendingSubmission.id());
                    assertThat(submission.submittedById()).isEqualTo(user.user().id());
                    assertThat(submission.submittedByUsername()).isEqualTo("listsubmissions");
                })
                .noneSatisfy(submission -> assertThat(submission.id()).isEqualTo(rejectedSubmission.id()));
    }

    @Test
    void listsOwnWatchSubmissionsByStatus() {
        var owner = authService.register(new RegisterRequest("ownsubmissions", "ownsubmissions@example.com", "StrongPassword123"));
        var otherUser = authService.register(new RegisterRequest("othersubmissions", "othersubmissions@example.com", "StrongPassword123"));
        var pendingSubmission = watchSubmissionService.submit(owner.user().id(), createWatchSubmissionRequest("Baltic", "Aquascaphe"));
        var rejectedSubmission = watchSubmissionService.submit(owner.user().id(), createWatchSubmissionRequest("Yema", "Superman"));
        var otherSubmission = watchSubmissionService.submit(otherUser.user().id(), createWatchSubmissionRequest("Squale", "1521"));
        watchSubmissionModerationService.reject(rejectedSubmission.id(), "Reference code is unclear");

        var page = watchSubmissionService.listMine(
                owner.user().id(),
                WatchSubmissionStatus.PENDING,
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        assertThat(page.getContent())
                .singleElement()
                .satisfies(submission -> {
                    assertThat(submission.id()).isEqualTo(pendingSubmission.id());
                    assertThat(submission.status()).isEqualTo(WatchSubmissionStatus.PENDING);
                    assertThat(submission.rejectionReason()).isNull();
                });
        assertThat(page.getContent())
                .noneSatisfy(submission -> assertThat(submission.id()).isIn(rejectedSubmission.id(), otherSubmission.id()));
    }

    @Test
    void rejectsModerationOfAlreadyReviewedSubmission() {
        var user = authService.register(new RegisterRequest("reviewedsubmission", "reviewedsubmission@example.com", "StrongPassword123"));
        var submission = watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("Hamilton", "Khaki Field"));
        watchSubmissionModerationService.reject(submission.id(), "Not enough data");

        assertThatThrownBy(() -> watchSubmissionModerationService.approve(submission.id()))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("Watch submission is not pending: " + submission.id());
    }
}
