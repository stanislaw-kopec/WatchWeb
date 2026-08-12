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
class ReviewIntegrationTest extends AbstractIntegrationTest {
    @Test
    void createsReviewAndUpdatesWatchRatingStats() {
        var user = authService.register(new RegisterRequest("reviewauthor", "reviewauthor@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Sinn", "556");

        var response = reviewService.create(watch.getId(), user.user().id(), new CreateReviewRequest(9, "Great everyday watch."));

        assertThat(response.id()).isNotNull();
        assertThat(response.watchId()).isEqualTo(watch.getId());
        assertThat(response.reviewerId()).isEqualTo(user.user().id());
        assertThat(response.rating()).isEqualTo(9);

        var updatedWatch = watchRepository.findById(watch.getId()).orElseThrow();
        assertThat(updatedWatch.getAverageRating()).isEqualByComparingTo("9.00");
        assertThat(updatedWatch.getReviewsCount()).isEqualTo(1);
    }

    @Test
    void rejectsDuplicateReviewForSameWatchBySameUser() {
        var user = authService.register(new RegisterRequest("duplicatereview", "duplicatereview@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Doxa", "Sub 300");
        reviewService.create(watch.getId(), user.user().id(), new CreateReviewRequest(8, "First review."));

        assertThatThrownBy(() -> reviewService.create(watch.getId(), user.user().id(), new CreateReviewRequest(7, "Second review.")))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("User has already reviewed this watch.");
    }

    @Test
    void listsReviewsForWatch() {
        var firstUser = authService.register(new RegisterRequest("reviewlistone", "reviewlistone@example.com", "StrongPassword123"));
        var secondUser = authService.register(new RegisterRequest("reviewlisttwo", "reviewlisttwo@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Oris", "Aquis");
        var otherWatch = saveCatalogWatch("Oris", "Big Crown");
        var expectedReview = reviewService.create(watch.getId(), firstUser.user().id(), new CreateReviewRequest(8, "Solid diver."));
        reviewService.create(otherWatch.getId(), secondUser.user().id(), new CreateReviewRequest(6, "Different watch."));

        var page = reviewService.listByWatch(watch.getId(), PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt")));

        assertThat(page.getContent())
                .singleElement()
                .satisfies(review -> {
                    assertThat(review.id()).isEqualTo(expectedReview.id());
                    assertThat(review.watchId()).isEqualTo(watch.getId());
                    assertThat(review.reviewerUsername()).isEqualTo("reviewlistone");
                });
    }

    @Test
    void listsReviewsCreatedByUserWithWatchSummary() {
        var reviewer = authService.register(new RegisterRequest("myreviews", "myreviews@example.com", "StrongPassword123"));
        var otherReviewer = authService.register(new RegisterRequest("otherreviews", "otherreviews@example.com", "StrongPassword123"));
        var firstWatch = saveCatalogWatch("Tudor", "Black Bay 58");
        var secondWatch = saveCatalogWatch("Nomos", "Club Campus");
        var otherWatch = saveCatalogWatch("Lorier", "Neptune");
        var firstReview = reviewService.create(firstWatch.getId(), reviewer.user().id(), new CreateReviewRequest(9, "Great proportions."));
        var secondReview = reviewService.create(secondWatch.getId(), reviewer.user().id(), new CreateReviewRequest(8, "Clean daily watch."));
        reviewService.create(otherWatch.getId(), otherReviewer.user().id(), new CreateReviewRequest(7, "Different reviewer."));

        var page = reviewService.listByReviewer(
                reviewer.user().id(),
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        assertThat(page.getContent())
                .hasSize(2)
                .anySatisfy(review -> {
                    assertThat(review.id()).isEqualTo(firstReview.id());
                    assertThat(review.watchId()).isEqualTo(firstWatch.getId());
                    assertThat(review.watchBrand()).isEqualTo("Tudor");
                    assertThat(review.watchModel()).isEqualTo("Black Bay 58");
                })
                .anySatisfy(review -> {
                    assertThat(review.id()).isEqualTo(secondReview.id());
                    assertThat(review.watchId()).isEqualTo(secondWatch.getId());
                    assertThat(review.watchBrand()).isEqualTo("Nomos");
                    assertThat(review.watchModel()).isEqualTo("Club Campus");
                });
    }

    @Test
    void updatesReviewAndRecalculatesWatchRatingStats() {
        var firstUser = authService.register(new RegisterRequest("updatereviewone", "updatereviewone@example.com", "StrongPassword123"));
        var secondUser = authService.register(new RegisterRequest("updatereviewtwo", "updatereviewtwo@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Mido", "Ocean Star");
        var review = reviewService.create(watch.getId(), firstUser.user().id(), new CreateReviewRequest(6, "Good watch."));
        reviewService.create(watch.getId(), secondUser.user().id(), new CreateReviewRequest(10, "Excellent watch."));

        var response = reviewService.update(
                watch.getId(),
                review.id(),
                firstUser.user().id(),
                new UpdateReviewRequest(8, "Better after more wrist time.")
        );

        assertThat(response.rating()).isEqualTo(8);
        assertThat(response.content()).isEqualTo("Better after more wrist time.");
        var updatedWatch = watchRepository.findById(watch.getId()).orElseThrow();
        assertThat(updatedWatch.getAverageRating()).isEqualByComparingTo("9.00");
        assertThat(updatedWatch.getReviewsCount()).isEqualTo(2);
    }

    @Test
    void deletesReviewAndRecalculatesWatchRatingStats() {
        var firstUser = authService.register(new RegisterRequest("deletereviewone", "deletereviewone@example.com", "StrongPassword123"));
        var secondUser = authService.register(new RegisterRequest("deletereviewtwo", "deletereviewtwo@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Tudor", "Black Bay");
        var review = reviewService.create(watch.getId(), firstUser.user().id(), new CreateReviewRequest(6, "Good."));
        reviewService.create(watch.getId(), secondUser.user().id(), new CreateReviewRequest(10, "Great."));

        reviewService.delete(watch.getId(), review.id(), firstUser.user().id(), false);

        var updatedWatch = watchRepository.findById(watch.getId()).orElseThrow();
        assertThat(updatedWatch.getAverageRating()).isEqualByComparingTo("10.00");
        assertThat(updatedWatch.getReviewsCount()).isEqualTo(1);
        assertThat(reviewService.listByWatch(watch.getId(), PageRequest.of(0, 10)).getContent())
                .singleElement()
                .satisfies(remainingReview -> assertThat(remainingReview.reviewerId()).isEqualTo(secondUser.user().id()));
    }

    @Test
    void rejectsUpdatingReviewOwnedByAnotherUser() {
        var owner = authService.register(new RegisterRequest("reviewowner", "reviewowner@example.com", "StrongPassword123"));
        var otherUser = authService.register(new RegisterRequest("reviewintruder", "reviewintruder@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Grand Seiko", "Snowflake");
        var review = reviewService.create(watch.getId(), owner.user().id(), new CreateReviewRequest(9, "Beautiful finishing."));

        assertThatThrownBy(() -> reviewService.update(
                watch.getId(),
                review.id(),
                otherUser.user().id(),
                new UpdateReviewRequest(1, "Trying to overwrite.")
        ))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Review belongs to another user");
    }

    @Test
    void rejectsDeletingReviewOwnedByAnotherUserWithoutModeratorRole() {
        var owner = authService.register(new RegisterRequest("reviewdeleteowner", "reviewdeleteowner@example.com", "StrongPassword123"));
        var otherUser = authService.register(new RegisterRequest("reviewdeleteintruder", "reviewdeleteintruder@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Rado", "Captain Cook");
        var review = reviewService.create(watch.getId(), owner.user().id(), new CreateReviewRequest(8, "Distinctive case design."));

        assertThatThrownBy(() -> reviewService.delete(watch.getId(), review.id(), otherUser.user().id(), false))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Review belongs to another user");
    }

    @Test
    void moderatorCanDeleteReviewOwnedByAnotherUser() {
        var owner = authService.register(new RegisterRequest("moderatedreviewowner", "moderatedreviewowner@example.com", "StrongPassword123"));
        var moderator = userRepository.saveAndFlush(new User(
                "reviewmoderator",
                "reviewmoderator@example.com",
                "{bcrypt}hash",
                Role.ROLE_MODERATOR
        ));
        var watch = saveCatalogWatch("Zenith", "Chronomaster");
        var review = reviewService.create(watch.getId(), owner.user().id(), new CreateReviewRequest(5, "Needs moderation."));

        reviewService.delete(watch.getId(), review.id(), moderator.getId(), true);

        var updatedWatch = watchRepository.findById(watch.getId()).orElseThrow();
        assertThat(updatedWatch.getAverageRating()).isEqualByComparingTo("0.00");
        assertThat(updatedWatch.getReviewsCount()).isZero();
        assertThat(reviewService.listByWatch(watch.getId(), PageRequest.of(0, 10)).getContent()).isEmpty();
    }
}
