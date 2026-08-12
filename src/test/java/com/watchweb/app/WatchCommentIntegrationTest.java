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
class WatchCommentIntegrationTest extends AbstractIntegrationTest {
    @Test
    void createsWatchCommentTree() {
        var user = authService.register(new RegisterRequest("commenttree", "commenttree@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Seiko", "Alpinist");
        var root = watchCommentService.create(
                watch.getId(),
                user.user().id(),
                new CreateWatchCommentRequest(null, "Root comment")
        );
        var reply = watchCommentService.create(
                watch.getId(),
                user.user().id(),
                new CreateWatchCommentRequest(root.id(), "Reply comment")
        );

        var tree = watchCommentService.listTree(watch.getId());

        assertThat(tree)
                .singleElement()
                .satisfies(comment -> {
                    assertThat(comment.id()).isEqualTo(root.id());
                    assertThat(comment.depth()).isEqualTo(1);
                    assertThat(comment.children())
                            .singleElement()
                            .satisfies(child -> {
                                assertThat(child.id()).isEqualTo(reply.id());
                                assertThat(child.parentId()).isEqualTo(root.id());
                                assertThat(child.depth()).isEqualTo(2);
                            });
                });
    }

    @Test
    void rejectsWatchCommentAboveMaximumDepth() {
        var user = authService.register(new RegisterRequest("commentdepth", "commentdepth@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Citizen", "Promaster");
        var root = watchCommentService.create(watch.getId(), user.user().id(), new CreateWatchCommentRequest(null, "Level 1"));
        var secondLevel = watchCommentService.create(watch.getId(), user.user().id(), new CreateWatchCommentRequest(root.id(), "Level 2"));
        var thirdLevel = watchCommentService.create(watch.getId(), user.user().id(), new CreateWatchCommentRequest(secondLevel.id(), "Level 3"));

        assertThatThrownBy(() -> watchCommentService.create(
                watch.getId(),
                user.user().id(),
                new CreateWatchCommentRequest(thirdLevel.id(), "Level 4")
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Maximum comment depth is 3");
    }

    @Test
    void softDeletesWatchCommentWithoutRemovingReplies() {
        var user = authService.register(new RegisterRequest("commentdelete", "commentdelete@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Hamilton", "Murph");
        var root = watchCommentService.create(watch.getId(), user.user().id(), new CreateWatchCommentRequest(null, "Root visible"));
        var reply = watchCommentService.create(watch.getId(), user.user().id(), new CreateWatchCommentRequest(root.id(), "Reply stays"));

        watchCommentService.delete(watch.getId(), root.id(), user.user().id(), false);

        var tree = watchCommentService.listTree(watch.getId());
        assertThat(tree)
                .singleElement()
                .satisfies(comment -> {
                    assertThat(comment.id()).isEqualTo(root.id());
                    assertThat(comment.deleted()).isTrue();
                    assertThat(comment.content()).isNull();
                    assertThat(comment.children())
                            .singleElement()
                            .satisfies(child -> assertThat(child.id()).isEqualTo(reply.id()));
                });
    }

    @Test
    void moderatorCanSoftDeleteWatchCommentOwnedByAnotherUser() {
        var owner = authService.register(new RegisterRequest("commentowner", "commentowner@example.com", "StrongPassword123"));
        var moderator = userRepository.saveAndFlush(new User(
                "commentmoderator",
                "commentmoderator@example.com",
                "{bcrypt}hash",
                Role.ROLE_MODERATOR
        ));
        var watch = saveCatalogWatch("Omega", "Aqua Terra");
        var comment = watchCommentService.create(watch.getId(), owner.user().id(), new CreateWatchCommentRequest(null, "Needs cleanup"));

        watchCommentService.delete(watch.getId(), comment.id(), moderator.getId(), true);

        assertThat(watchCommentService.listTree(watch.getId()))
                .singleElement()
                .satisfies(deletedComment -> assertThat(deletedComment.deleted()).isTrue());
    }

    @Test
    void rejectsDeletingWatchCommentOwnedByAnotherUserWithoutModeratorRole() {
        var owner = authService.register(new RegisterRequest("commentownerplain", "commentownerplain@example.com", "StrongPassword123"));
        var otherUser = authService.register(new RegisterRequest("commentintruder", "commentintruder@example.com", "StrongPassword123"));
        var watch = saveCatalogWatch("Longines", "Legend Diver");
        var comment = watchCommentService.create(watch.getId(), owner.user().id(), new CreateWatchCommentRequest(null, "Owner comment"));

        assertThatThrownBy(() -> watchCommentService.delete(watch.getId(), comment.id(), otherUser.user().id(), false))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Comment belongs to another user");
    }
}
