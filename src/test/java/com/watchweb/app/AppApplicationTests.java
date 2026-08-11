package com.watchweb.app;

import com.watchweb.app.domain.auth.dto.RegisterRequest;
import com.watchweb.app.domain.auth.dto.LoginRequest;
import com.watchweb.app.domain.auth.dto.RefreshTokenRequest;
import com.watchweb.app.domain.auth.service.AuthService;
import com.watchweb.app.domain.comment.dto.CreateWatchCommentRequest;
import com.watchweb.app.domain.comment.service.WatchCommentService;
import com.watchweb.app.domain.post.dto.CreatePostRequest;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.repository.PostRepository;
import com.watchweb.app.domain.post.service.PostService;
import com.watchweb.app.domain.review.dto.CreateReviewRequest;
import com.watchweb.app.domain.review.dto.UpdateReviewRequest;
import com.watchweb.app.domain.review.service.ReviewService;
import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.entity.User;
import com.watchweb.app.domain.user.repository.UserRepository;
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
import com.watchweb.app.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers
@SpringBootTest
class AppApplicationTests {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:18")
            .withDatabaseName("watchweb")
            .withUsername("postgres")
            .withPassword("password");

    @DynamicPropertySource
    static void registerDatasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private WatchSubmissionService watchSubmissionService;

    @Autowired
    private WatchSubmissionRepository watchSubmissionRepository;

    @Autowired
    private WatchRepository watchRepository;

    @Autowired
    private WatchNameNormalizer watchNameNormalizer;

    @Autowired
    private WatchCatalogService watchCatalogService;

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private WatchCommentService watchCommentService;

    @Autowired
    private PostService postService;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private WatchSubmissionModerationService watchSubmissionModerationService;

    @Test
    void contextLoads() {
    }

    @Test
    void savesUser() {
        var user = new User("janek", "janek@example.com", "{bcrypt}hash", Role.ROLE_USER);

        var savedUser = userRepository.saveAndFlush(user);

        assertThat(savedUser.getId()).isNotNull();
        assertThat(savedUser.getCreatedAt()).isNotNull();
        assertThat(savedUser.getUpdatedAt()).isNotNull();
        assertThat(userRepository.existsByEmail("janek@example.com")).isTrue();
    }

    @Test
    void registersUserWithBcryptPasswordHash() {
        var request = new RegisterRequest("kasia", "KASIA@example.com", "StrongPassword123");

        var response = authService.register(request);

        var savedUser = userRepository.findById(response.user().id()).orElseThrow();
        assertThat(response.user().role()).isEqualTo(Role.ROLE_USER);
        assertThat(response.user().email()).isEqualTo("kasia@example.com");
        assertThat(savedUser.getPasswordHash()).isNotEqualTo("StrongPassword123");
        assertThat(passwordEncoder.matches("StrongPassword123", savedUser.getPasswordHash())).isTrue();
    }

    @Test
    void rejectsDuplicateEmailDuringRegistration() {
        authService.register(new RegisterRequest("marek", "marek@example.com", "StrongPassword123"));

        assertThatThrownBy(() -> authService.register(new RegisterRequest("marek2", "marek@example.com", "StrongPassword123")))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessage("Email is already taken");
    }

    @Test
    void logsInRegisteredUser() {
        var registered = authService.register(new RegisterRequest("loginuser", "loginuser@example.com", "StrongPassword123"));

        var response = authService.login(new LoginRequest("loginuser@example.com", "StrongPassword123"));

        assertThat(response.tokenType()).isEqualTo("Bearer");
        assertThat(response.accessToken()).isNotBlank();
        assertThat(response.refreshToken()).isNotBlank();
        assertThat(response.user().id()).isEqualTo(registered.user().id());
        assertThat(jwtService.extractUserId(response.accessToken())).isEqualTo(registered.user().id());
    }

    @Test
    void rejectsLoginWithInvalidPassword() {
        authService.register(new RegisterRequest("badpassword", "badpassword@example.com", "StrongPassword123"));

        assertThatThrownBy(() -> authService.login(new LoginRequest("badpassword@example.com", "WrongPassword123")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");
    }

    @Test
    void refreshesTokenAndRejectsRefreshTokenReuse() {
        authService.register(new RegisterRequest("refreshuser", "refreshuser@example.com", "StrongPassword123"));
        var loginResponse = authService.login(new LoginRequest("refreshuser@example.com", "StrongPassword123"));

        var refreshResponse = authService.refresh(new RefreshTokenRequest(loginResponse.refreshToken()));

        assertThat(refreshResponse.accessToken()).isNotBlank();
        assertThat(refreshResponse.refreshToken()).isNotBlank();
        assertThat(refreshResponse.refreshToken()).isNotEqualTo(loginResponse.refreshToken());
        assertThatThrownBy(() -> authService.refresh(new RefreshTokenRequest(loginResponse.refreshToken())))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid refresh token");
    }

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
    void rejectsModerationOfAlreadyReviewedSubmission() {
        var user = authService.register(new RegisterRequest("reviewedsubmission", "reviewedsubmission@example.com", "StrongPassword123"));
        var submission = watchSubmissionService.submit(user.user().id(), createWatchSubmissionRequest("Hamilton", "Khaki Field"));
        watchSubmissionModerationService.reject(submission.id(), "Not enough data");

        assertThatThrownBy(() -> watchSubmissionModerationService.approve(submission.id()))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("Watch submission is not pending: " + submission.id());
    }

    private CreateWatchSubmissionRequest createWatchSubmissionRequest(String brand, String model) {
        return new CreateWatchSubmissionRequest(
                brand,
                model,
                model + "-REF",
                new WatchDetailsRequest(
                        MovementType.AUTOMATIC,
                        "Test caliber",
                        BigDecimal.valueOf(40.00),
                        BigDecimal.valueOf(12.50),
                        BigDecimal.valueOf(46.00),
                        BigDecimal.valueOf(20.00),
                        100,
                        "Sapphire",
                        "Stainless steel"
                )
        );
    }

    private Watch saveCatalogWatch(String brand, String model) {
        return saveCatalogWatch(brand, model, MovementType.AUTOMATIC, null, 100);
    }

    private Watch saveCatalogWatch(
            String brand,
            String model,
            MovementType movementType,
            BigDecimal caseDiameterMm,
            Integer waterResistanceM
    ) {
        return watchRepository.saveAndFlush(new Watch(
                brand,
                model,
                model + "-REF",
                watchNameNormalizer.normalize(brand),
                watchNameNormalizer.normalize(model),
                new WatchDetails(movementType, null, caseDiameterMm, null, null, null, waterResistanceM, "Sapphire", "Stainless steel")
        ));
    }
}
