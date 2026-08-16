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
class PostIntegrationTest extends AbstractIntegrationTest {
    @Test
    void createsUserPostAsPendingModeration() {
        var user = authService.register(new RegisterRequest("postauthor", "postauthor@example.com", "StrongPassword123"));

        var response = postService.create(
                user.user().id(),
                new CreatePostRequest("My first post", "This post should wait for moderation.")
        );

        assertThat(response.id()).isNotNull();
        assertThat(response.authorId()).isEqualTo(user.user().id());
        assertThat(response.status()).isEqualTo(PostStatus.PENDING);
        assertThat(postRepository.findById(response.id()).orElseThrow().getStatus()).isEqualTo(PostStatus.PENDING);
    }

    @Test
    void listsOnlyApprovedPosts() {
        var user = authService.register(new RegisterRequest("postlistauthor", "postlistauthor@example.com", "StrongPassword123"));
        var pendingPost = postService.create(user.user().id(), new CreatePostRequest("Pending post", "Not visible yet."));
        var approvedPost = postService.create(user.user().id(), new CreatePostRequest("Approved post", "Visible after moderation."));
        var approvedEntity = postRepository.findById(approvedPost.id()).orElseThrow();
        approvedEntity.approve();
        postRepository.saveAndFlush(approvedEntity);

        var page = postService.listApproved(PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")));

        assertThat(page.getContent())
                .anySatisfy(post -> {
                    assertThat(post.id()).isEqualTo(approvedPost.id());
                    assertThat(post.status()).isEqualTo(PostStatus.APPROVED);
                })
                .noneSatisfy(post -> assertThat(post.id()).isEqualTo(pendingPost.id()));
    }

    @Test
    void searchesApprovedPostsByTextAndHashtag() {
        var user = authService.register(new RegisterRequest("postsearchauthor", "postsearchauthor@example.com", "StrongPassword123"));
        var matchingPost = postService.create(
                user.user().id(),
                new CreatePostRequest("Vintage chronograph", "A practical guide to Seiko collecting.", List.of("#Seiko", "Chronograph"))
        );
        var wrongHashtagPost = postService.create(
                user.user().id(),
                new CreatePostRequest("Vintage chronograph from another brand", "This one should not match the hashtag.", List.of("omega"))
        );
        var pendingPost = postService.create(
                user.user().id(),
                new CreatePostRequest("Pending chronograph", "This one is not approved yet.", List.of("seiko"))
        );
        postModerationService.approve(matchingPost.id());
        postModerationService.approve(wrongHashtagPost.id());

        var page = postService.searchApproved(
                "chronograph",
                "#SEIKO",
                PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        assertThat(page.getContent())
                .singleElement()
                .satisfies(post -> {
                    assertThat(post.id()).isEqualTo(matchingPost.id());
                    assertThat(post.hashtags()).contains("seiko");
                });
        assertThat(page.getContent())
                .noneSatisfy(post -> assertThat(post.id()).isIn(wrongHashtagPost.id(), pendingPost.id()));
    }

    @Test
    void returnsApprovedPostById() {
        var user = authService.register(new RegisterRequest("postdetailsauthor", "postdetailsauthor@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Approved details", "Visible details."));
        var entity = postRepository.findById(post.id()).orElseThrow();
        entity.approve();
        postRepository.saveAndFlush(entity);

        var response = postService.getApprovedById(post.id());

        assertThat(response.id()).isEqualTo(post.id());
        assertThat(response.title()).isEqualTo("Approved details");
        assertThat(response.status()).isEqualTo(PostStatus.APPROVED);
    }

    @Test
    void rejectsPendingPostPublicDetails() {
        var user = authService.register(new RegisterRequest("postpendingdetails", "postpendingdetails@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Pending details", "Hidden details."));

        assertThatThrownBy(() -> postService.getApprovedById(post.id()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Post not found: " + post.id());
    }

    @Test
    void listsPostsForModerationByStatus() {
        var user = authService.register(new RegisterRequest("postmoderationlist", "postmoderationlist@example.com", "StrongPassword123"));
        var pendingPost = postService.create(user.user().id(), new CreatePostRequest("Needs review", "Please review this post."));
        var approvedPost = postService.create(user.user().id(), new CreatePostRequest("Already approved", "This one is already approved."));
        postModerationService.approve(approvedPost.id());

        var page = postModerationService.list(
                PostStatus.PENDING,
                PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        assertThat(page.getContent())
                .allSatisfy(post -> assertThat(post.status()).isEqualTo(PostStatus.PENDING))
                .anySatisfy(post -> assertThat(post.id()).isEqualTo(pendingPost.id()))
                .noneSatisfy(post -> assertThat(post.id()).isEqualTo(approvedPost.id()));
    }

    @Test
    void publishesPostApprovedEvent() {
        var user = authService.register(new RegisterRequest("postapprovedevent", "postapprovedevent@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Approved event", "Author should be notified."));

        postModerationService.approve(post.id());

        var events = applicationEvents.stream(PostApprovedEvent.class).toList();
        assertThat(events).hasSize(1);
        var event = events.getFirst();
        assertThat(event.postId()).isEqualTo(post.id());
        assertThat(event.authorId()).isEqualTo(user.user().id());
        assertThat(event.title()).isEqualTo("Approved event");
    }

    @Test
    void publishesPostRejectedEvent() {
        var user = authService.register(new RegisterRequest("postrejectedevent", "postrejectedevent@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Rejected event", "Author should see the reason."));

        postModerationService.reject(post.id(), "  Needs more detail.  ");

        var events = applicationEvents.stream(PostRejectedEvent.class).toList();
        assertThat(events).hasSize(1);
        var event = events.getFirst();
        assertThat(event.postId()).isEqualTo(post.id());
        assertThat(event.authorId()).isEqualTo(user.user().id());
        assertThat(event.title()).isEqualTo("Rejected event");
        assertThat(event.reason()).isEqualTo("Needs more detail.");
    }

    @Test
    void createsNotificationWhenPostIsApproved() {
        var user = authService.register(new RegisterRequest("postapprovednotification", "postapprovednotification@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Approved notification", "Author should see approval."));

        postModerationService.approve(post.id());

        var page = notificationService.list(user.user().id(), PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")));
        assertThat(page.getContent())
                .anySatisfy(notification -> {
                    assertThat(notification.type()).isEqualTo(NotificationType.POST_APPROVED);
                    assertThat(notification.message()).isEqualTo("Post approved: Approved notification");
                    assertThat(notification.targetId()).isEqualTo(post.id());
                    assertThat(notification.read()).isFalse();
                });
    }

    @Test
    void createsNotificationWhenPostIsRejected() {
        var user = authService.register(new RegisterRequest("postrejectednotification", "postrejectednotification@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Rejected notification", "Author should see rejection."));

        postModerationService.reject(post.id(), "Needs more context");

        var page = notificationService.list(user.user().id(), PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")));
        assertThat(page.getContent())
                .anySatisfy(notification -> {
                    assertThat(notification.type()).isEqualTo(NotificationType.POST_REJECTED);
                    assertThat(notification.message()).isEqualTo("Post rejected: Rejected notification. Reason: Needs more context");
                    assertThat(notification.targetId()).isEqualTo(post.id());
                    assertThat(notification.read()).isFalse();
                });
    }

    @Test
    void marksOwnNotificationAsRead() {
        var user = authService.register(new RegisterRequest("readnotification", "readnotification@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Read notification", "Author should mark it read."));
        postModerationService.approve(post.id());
        var notification = notificationService.list(user.user().id(), PageRequest.of(0, 20)).getContent().getFirst();

        assertThat(notificationService.countUnread(user.user().id())).isEqualTo(1);

        var response = notificationService.markAsRead(notification.id(), user.user().id());

        assertThat(response.read()).isTrue();
        assertThat(response.readAt()).isNotNull();
        assertThat(notificationService.countUnread(user.user().id())).isZero();
    }

    @Test
    void approvesPostAndMakesItPublic() {
        var user = authService.register(new RegisterRequest("postapprove", "postapprove@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Approve me", "This post should become public."));

        var response = postModerationService.approve(post.id());

        assertThat(response.status()).isEqualTo(PostStatus.APPROVED);
        assertThat(response.rejectionReason()).isNull();
        assertThat(postService.getApprovedById(post.id()).id()).isEqualTo(post.id());
    }

    @Test
    void rejectsPostWithReason() {
        var user = authService.register(new RegisterRequest("postreject", "postreject@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Reject me", "This post needs changes."));

        var response = postModerationService.reject(post.id(), "Please add more details");

        assertThat(response.status()).isEqualTo(PostStatus.REJECTED);
        assertThat(response.rejectionReason()).isEqualTo("Please add more details");
        assertThatThrownBy(() -> postService.getApprovedById(post.id()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Post not found: " + post.id());
    }

    @Test
    void rejectsModerationOfAlreadyReviewedPost() {
        var user = authService.register(new RegisterRequest("postalreadymoderated", "postalreadymoderated@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Reviewed post", "This post will be reviewed once."));
        postModerationService.approve(post.id());

        assertThatThrownBy(() -> postModerationService.reject(post.id(), "Too late"))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("Post is not pending: " + post.id());
    }

    @Test
    void updatesOwnPendingPostAndKeepsItPending() {
        var user = authService.register(new RegisterRequest("postupdatepending", "postupdatepending@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Original pending", "Original content."));

        var response = postService.update(
                post.id(),
                user.user().id(),
                new UpdatePostRequest("Updated pending", "Updated content.")
        );

        assertThat(response.title()).isEqualTo("Updated pending");
        assertThat(response.content()).isEqualTo("Updated content.");
        assertThat(response.status()).isEqualTo(PostStatus.PENDING);
        assertThat(response.rejectionReason()).isNull();
    }

    @Test
    void updatesRejectedPostBackToPendingModeration() {
        var user = authService.register(new RegisterRequest("postupdaterejected", "postupdaterejected@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Rejected original", "Needs work."));
        postModerationService.reject(post.id(), "Please add more details");

        var response = postService.update(
                post.id(),
                user.user().id(),
                new UpdatePostRequest("Rejected updated", "Now it has more details.")
        );

        assertThat(response.status()).isEqualTo(PostStatus.PENDING);
        assertThat(response.rejectionReason()).isNull();
        assertThat(response.title()).isEqualTo("Rejected updated");
    }

    @Test
    void updatesApprovedPostBackToPendingModeration() {
        var user = authService.register(new RegisterRequest("postupdateapproved", "postupdateapproved@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Approved original", "Visible content."));
        postModerationService.approve(post.id());

        var response = postService.update(
                post.id(),
                user.user().id(),
                new UpdatePostRequest("Approved updated", "Changed after approval.")
        );

        assertThat(response.status()).isEqualTo(PostStatus.PENDING);
        assertThatThrownBy(() -> postService.getApprovedById(post.id()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Post not found: " + post.id());
    }

    @Test
    void rejectsUpdatingPostOwnedByAnotherUser() {
        var owner = authService.register(new RegisterRequest("postowner", "postowner@example.com", "StrongPassword123"));
        var otherUser = authService.register(new RegisterRequest("postintruder", "postintruder@example.com", "StrongPassword123"));
        var post = postService.create(owner.user().id(), new CreatePostRequest("Owner post", "Only owner can edit this."));

        assertThatThrownBy(() -> postService.update(
                post.id(),
                otherUser.user().id(),
                new UpdatePostRequest("Intruder update", "This should not be accepted.")
        ))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Post belongs to another user");
    }

    @Test
    void updatesOwnPostImageAndReturnsApprovedPostToPendingModeration() throws Exception {
        var user = authService.register(new RegisterRequest("postimageowner", "postimageowner@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Post with image", "This post will get an image."));
        postModerationService.approve(post.id());
        var file = new MockMultipartFile(
                "file",
                "post-image.jpg",
                "image/jpeg",
                "post-image-content".getBytes(StandardCharsets.UTF_8)
        );

        var response = postService.updateImage(post.id(), user.user().id(), file);

        assertThat(response.imageUrl()).startsWith("/api/files/post-images/");
        assertThat(response.imageUrl()).endsWith(".jpg");
        assertThat(response.status()).isEqualTo(PostStatus.PENDING);
        assertThat(response.rejectionReason()).isNull();
        assertThatThrownBy(() -> postService.getApprovedById(post.id()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Post not found: " + post.id());

        var filename = response.imageUrl().substring(response.imageUrl().lastIndexOf('/') + 1);
        var resource = storageService.load("post-images", filename);
        assertThat(resource.getInputStream().readAllBytes()).isEqualTo("post-image-content".getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void rejectsUpdatingPostImageOwnedByAnotherUser() {
        var owner = authService.register(new RegisterRequest("postimageowner2", "postimageowner2@example.com", "StrongPassword123"));
        var otherUser = authService.register(new RegisterRequest("postimageintruder", "postimageintruder@example.com", "StrongPassword123"));
        var post = postService.create(owner.user().id(), new CreatePostRequest("Owner image post", "Only owner can set image."));
        var file = new MockMultipartFile(
                "file",
                "post-image.png",
                "image/png",
                "post-image-content".getBytes(StandardCharsets.UTF_8)
        );

        assertThatThrownBy(() -> postService.updateImage(post.id(), otherUser.user().id(), file))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Post belongs to another user");
    }

    @Test
    void listsOwnPostsWithAllStatuses() {
        var user = authService.register(new RegisterRequest("postmine", "postmine@example.com", "StrongPassword123"));
        var otherUser = authService.register(new RegisterRequest("postmineother", "postmineother@example.com", "StrongPassword123"));
        var pendingPost = postService.create(user.user().id(), new CreatePostRequest("My pending", "Waiting."));
        var rejectedPost = postService.create(user.user().id(), new CreatePostRequest("My rejected", "Needs changes."));
        var approvedPost = postService.create(user.user().id(), new CreatePostRequest("My approved", "Visible."));
        var otherPost = postService.create(otherUser.user().id(), new CreatePostRequest("Other pending", "Not mine."));
        postModerationService.reject(rejectedPost.id(), "Please expand it");
        postModerationService.approve(approvedPost.id());

        var page = postService.listMine(
                user.user().id(),
                null,
                PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        assertThat(page.getContent())
                .extracting(post -> post.id())
                .contains(pendingPost.id(), rejectedPost.id(), approvedPost.id())
                .doesNotContain(otherPost.id());
    }

    @Test
    void filtersOwnPostsByStatus() {
        var user = authService.register(new RegisterRequest("postminefilter", "postminefilter@example.com", "StrongPassword123"));
        var pendingPost = postService.create(user.user().id(), new CreatePostRequest("Filter pending", "Waiting."));
        var rejectedPost = postService.create(user.user().id(), new CreatePostRequest("Filter rejected", "Needs changes."));
        postModerationService.reject(rejectedPost.id(), "Please expand it");

        var page = postService.listMine(
                user.user().id(),
                PostStatus.REJECTED,
                PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        assertThat(page.getContent())
                .singleElement()
                .satisfies(post -> {
                    assertThat(post.id()).isEqualTo(rejectedPost.id());
                    assertThat(post.status()).isEqualTo(PostStatus.REJECTED);
                    assertThat(post.rejectionReason()).isEqualTo("Please expand it");
                });
        assertThat(page.getContent())
                .noneSatisfy(post -> assertThat(post.id()).isEqualTo(pendingPost.id()));
    }

    @Test
    void softDeletesOwnApprovedPostAndHidesItFromPublicAndMineLists() {
        var user = authService.register(new RegisterRequest("postdeleteapproved", "postdeleteapproved@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Delete approved", "This will be hidden."));
        postModerationService.approve(post.id());

        postService.delete(post.id(), user.user().id());

        assertThat(postRepository.findById(post.id()).orElseThrow().getDeletedAt()).isNotNull();
        assertThatThrownBy(() -> postService.getApprovedById(post.id()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Post not found: " + post.id());
        assertThat(postService.listMine(user.user().id(), null, PageRequest.of(0, 20)).getContent())
                .noneSatisfy(response -> assertThat(response.id()).isEqualTo(post.id()));
    }

    @Test
    void softDeletesOwnPendingPostAndRemovesItFromModerationQueue() {
        var user = authService.register(new RegisterRequest("postdeletepending", "postdeletepending@example.com", "StrongPassword123"));
        var post = postService.create(user.user().id(), new CreatePostRequest("Delete pending", "This should leave the queue."));

        postService.delete(post.id(), user.user().id());

        var page = postModerationService.list(
                PostStatus.PENDING,
                PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        assertThat(page.getContent())
                .noneSatisfy(response -> assertThat(response.id()).isEqualTo(post.id()));
        assertThatThrownBy(() -> postModerationService.approve(post.id()))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Post not found: " + post.id());
    }

    @Test
    void rejectsDeletingPostOwnedByAnotherUser() {
        var owner = authService.register(new RegisterRequest("postdeleteowner", "postdeleteowner@example.com", "StrongPassword123"));
        var otherUser = authService.register(new RegisterRequest("postdeleteintruder", "postdeleteintruder@example.com", "StrongPassword123"));
        var post = postService.create(owner.user().id(), new CreatePostRequest("Owner delete post", "Only owner can delete this."));

        assertThatThrownBy(() -> postService.delete(post.id(), otherUser.user().id()))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessage("Post belongs to another user");
        assertThat(postRepository.findById(post.id()).orElseThrow().getDeletedAt()).isNull();
    }
}
