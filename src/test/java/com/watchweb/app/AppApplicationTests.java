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

@Testcontainers
@SpringBootTest
@RecordApplicationEvents
class AppApplicationTests {

    private static final Path TEST_STORAGE_PATH = Path.of("target", "test-storage").toAbsolutePath();

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
        registry.add("app.storage.local.base-path", TEST_STORAGE_PATH::toString);
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserAdminService userAdminService;

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
    private PostCommentService postCommentService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PostService postService;

    @Autowired
    private PostModerationService postModerationService;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private WatchSubmissionModerationService watchSubmissionModerationService;

    @Autowired
    private ArticleService articleService;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private ApplicationEvents applicationEvents;

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
    void updatesCurrentUserAvatar() throws Exception {
        var user = authService.register(new RegisterRequest("avataruser", "avataruser@example.com", "StrongPassword123"));
        var file = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                "avatar-content".getBytes(StandardCharsets.UTF_8)
        );

        var response = userService.updateAvatar(user.user().id(), file);

        assertThat(response.avatarUrl()).startsWith("/api/files/avatars/");
        assertThat(response.avatarUrl()).endsWith(".png");
        assertThat(userRepository.findById(user.user().id()).orElseThrow().getAvatarUrl()).isEqualTo(response.avatarUrl());

        var filename = response.avatarUrl().substring(response.avatarUrl().lastIndexOf('/') + 1);
        var resource = storageService.load("avatars", filename);
        assertThat(resource.getInputStream().readAllBytes()).isEqualTo("avatar-content".getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void adminListsUsers() {
        var user = authService.register(new RegisterRequest("adminlisteduser", "adminlisteduser@example.com", "StrongPassword123"));

        var page = userAdminService.list(PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt")));

        assertThat(page.getContent())
                .anySatisfy(response -> {
                    assertThat(response.id()).isEqualTo(user.user().id());
                    assertThat(response.username()).isEqualTo("adminlisteduser");
                });
    }

    @Test
    void adminUpdatesUserRole() {
        var admin = userRepository.saveAndFlush(new User(
                "roleadmin",
                "roleadmin@example.com",
                "{bcrypt}hash",
                Role.ROLE_ADMIN
        ));
        var user = authService.register(new RegisterRequest("promoteduser", "promoteduser@example.com", "StrongPassword123"));

        var response = userAdminService.updateRole(
                user.user().id(),
                admin.getId(),
                new UpdateUserRoleRequest(Role.ROLE_MODERATOR)
        );

        assertThat(response.role()).isEqualTo(Role.ROLE_MODERATOR);
        assertThat(userRepository.findById(user.user().id()).orElseThrow().getRole()).isEqualTo(Role.ROLE_MODERATOR);
    }

    @Test
    void rejectsRemovingOwnAdminRole() {
        var admin = userRepository.saveAndFlush(new User(
                "selfroleadmin",
                "selfroleadmin@example.com",
                "{bcrypt}hash",
                Role.ROLE_ADMIN
        ));

        assertThatThrownBy(() -> userAdminService.updateRole(
                admin.getId(),
                admin.getId(),
                new UpdateUserRoleRequest(Role.ROLE_USER)
        ))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessage("Admin cannot remove their own admin role");
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
    void logsOutByRevokingRefreshToken() {
        authService.register(new RegisterRequest("logoutuser", "logoutuser@example.com", "StrongPassword123"));
        var loginResponse = authService.login(new LoginRequest("logoutuser@example.com", "StrongPassword123"));

        authService.logout(new LogoutRequest(loginResponse.refreshToken()));

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

        var response = notificationService.markAsRead(notification.id(), user.user().id());

        assertThat(response.read()).isTrue();
        assertThat(response.readAt()).isNotNull();
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

    @Test
    void createsPostWithNormalizedHashtags() {
        var user = authService.register(new RegisterRequest("posthashtags", "posthashtags@example.com", "StrongPassword123"));

        var response = postService.create(
                user.user().id(),
                new CreatePostRequest("Hashtag post", "This post has tags.", List.of("#Seiko", "Diver!", "Żegarek", "seiko"))
        );

        assertThat(response.hashtags()).containsExactly("diver", "seiko", "zegarek");
    }

    @Test
    void updatesPostHashtagsAndReturnsPostToPending() {
        var user = authService.register(new RegisterRequest("posthashtagupdate", "posthashtagupdate@example.com", "StrongPassword123"));
        var post = postService.create(
                user.user().id(),
                new CreatePostRequest("Original hashtags", "Original content.", List.of("oldtag"))
        );
        postModerationService.approve(post.id());

        var response = postService.update(
                post.id(),
                user.user().id(),
                new UpdatePostRequest("Updated hashtags", "Updated content.", List.of("#NewTag"))
        );

        assertThat(response.status()).isEqualTo(PostStatus.PENDING);
        assertThat(response.hashtags()).containsExactly("newtag");
    }

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

    @Test
    void storesAllowedImageAndLoadsIt() throws Exception {
        var file = new MockMultipartFile(
                "file",
                "avatar.jpg",
                "image/jpeg",
                "fake-image-content".getBytes(StandardCharsets.UTF_8)
        );

        var storedFile = storageService.store(file, StorageFolder.AVATARS);
        var resource = storageService.load(storedFile.folder(), storedFile.filename());

        assertThat(storedFile.folder()).isEqualTo("avatars");
        assertThat(storedFile.filename()).endsWith(".jpg");
        assertThat(storedFile.url()).startsWith("/api/files/avatars/");
        assertThat(resource.exists()).isTrue();
        assertThat(resource.getInputStream().readAllBytes()).isEqualTo("fake-image-content".getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void rejectsUnsupportedFileType() {
        var file = new MockMultipartFile(
                "file",
                "avatar.gif",
                "image/gif",
                "fake-image-content".getBytes(StandardCharsets.UTF_8)
        );

        assertThatThrownBy(() -> storageService.store(file, StorageFolder.AVATARS))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("Only JPG, PNG and WEBP files are allowed");
    }

    @Test
    void rejectsTooLargeFile() {
        var file = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                new byte[(5 * 1024 * 1024) + 1]
        );

        assertThatThrownBy(() -> storageService.store(file, StorageFolder.AVATARS))
                .isInstanceOf(BadRequestException.class)
                .hasMessage("File size must not exceed 5 MB");
    }

    @Test
    void rejectsLoadingMissingFile() {
        assertThatThrownBy(() -> storageService.load("avatars", "missing.jpg"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("File not found");
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
