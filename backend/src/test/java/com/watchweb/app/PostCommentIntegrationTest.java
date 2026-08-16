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
class PostCommentIntegrationTest extends AbstractIntegrationTest {
    @Test
    void createsPostCommentTreeForApprovedPost() {
        var author = authService.register(new RegisterRequest("postcommentauthor", "postcommentauthor@example.com", "StrongPassword123"));
        var commenter = authService.register(new RegisterRequest("postcommenter", "postcommenter@example.com", "StrongPassword123"));
        var post = postService.create(author.user().id(), new CreatePostRequest("Commented post", "Comments are welcome."));
        postModerationService.approve(post.id());

        var root = postCommentService.create(post.id(), commenter.user().id(), new CreatePostCommentRequest(null, "Root comment"));
        var reply = postCommentService.create(post.id(), author.user().id(), new CreatePostCommentRequest(root.id(), "Reply comment"));

        var tree = postCommentService.listTree(post.id());

        assertThat(tree)
                .singleElement()
                .satisfies(rootComment -> {
                    assertThat(rootComment.id()).isEqualTo(root.id());
                    assertThat(rootComment.children())
                            .singleElement()
                            .satisfies(replyComment -> assertThat(replyComment.id()).isEqualTo(reply.id()));
                });
    }

    @Test
    void rejectsCommentingPendingPost() {
        var author = authService.register(new RegisterRequest("pendingpostcommentauthor", "pendingpostcommentauthor@example.com", "StrongPassword123"));
        var commenter = authService.register(new RegisterRequest("pendingpostcommenter", "pendingpostcommenter@example.com", "StrongPassword123"));
        var post = postService.create(author.user().id(), new CreatePostRequest("Pending comments", "Not public yet."));

        assertThatThrownBy(() -> postCommentService.create(
                post.id(),
                commenter.user().id(),
                new CreatePostCommentRequest(null, "This should fail")
        ))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Post not found: " + post.id());
    }

    @Test
    void rejectsPostCommentDepthOverThree() {
        var author = authService.register(new RegisterRequest("postcommentdepthauthor", "postcommentdepthauthor@example.com", "StrongPassword123"));
        var commenter = authService.register(new RegisterRequest("postcommentdepthuser", "postcommentdepthuser@example.com", "StrongPassword123"));
        var post = postService.create(author.user().id(), new CreatePostRequest("Depth post", "Depth limit."));
        postModerationService.approve(post.id());
        var levelOne = postCommentService.create(post.id(), commenter.user().id(), new CreatePostCommentRequest(null, "Level 1"));
        var levelTwo = postCommentService.create(post.id(), commenter.user().id(), new CreatePostCommentRequest(levelOne.id(), "Level 2"));
        var levelThree = postCommentService.create(post.id(), commenter.user().id(), new CreatePostCommentRequest(levelTwo.id(), "Level 3"));

        assertThatThrownBy(() -> postCommentService.create(
                post.id(),
                commenter.user().id(),
                new CreatePostCommentRequest(levelThree.id(), "Level 4")
        ))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Maximum comment depth is 3");
    }

    @Test
    void softDeletesPostCommentAndKeepsReplies() {
        var author = authService.register(new RegisterRequest("postcommentdeleteauthor", "postcommentdeleteauthor@example.com", "StrongPassword123"));
        var commenter = authService.register(new RegisterRequest("postcommentdeleteuser", "postcommentdeleteuser@example.com", "StrongPassword123"));
        var post = postService.create(author.user().id(), new CreatePostRequest("Delete comment post", "Deletion keeps replies."));
        postModerationService.approve(post.id());
        var root = postCommentService.create(post.id(), commenter.user().id(), new CreatePostCommentRequest(null, "Root comment"));
        var reply = postCommentService.create(post.id(), author.user().id(), new CreatePostCommentRequest(root.id(), "Reply comment"));

        postCommentService.delete(post.id(), root.id(), commenter.user().id(), false);

        assertThat(postCommentService.listTree(post.id()))
                .singleElement()
                .satisfies(deletedRoot -> {
                    assertThat(deletedRoot.deleted()).isTrue();
                    assertThat(deletedRoot.content()).isNull();
                    assertThat(deletedRoot.children())
                            .singleElement()
                            .satisfies(replyComment -> assertThat(replyComment.id()).isEqualTo(reply.id()));
                });
    }

    @Test
    void rejectsDeletingPostCommentOwnedByAnotherUserWithoutModeratorRole() {
        var author = authService.register(new RegisterRequest("postcommentowner", "postcommentowner@example.com", "StrongPassword123"));
        var otherUser = authService.register(new RegisterRequest("postcommentintruder", "postcommentintruder@example.com", "StrongPassword123"));
        var post = postService.create(author.user().id(), new CreatePostRequest("Owned comment post", "Only owner can delete."));
        postModerationService.approve(post.id());
        var comment = postCommentService.create(post.id(), author.user().id(), new CreatePostCommentRequest(null, "Owner comment"));

        assertThatThrownBy(() -> postCommentService.delete(post.id(), comment.id(), otherUser.user().id(), false))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Comment belongs to another user");
    }
}
