package com.watchweb.app.config;

import com.watchweb.app.domain.article.dto.CreateArticleRequest;
import com.watchweb.app.domain.article.service.ArticleService;
import com.watchweb.app.domain.comment.dto.CreatePostCommentRequest;
import com.watchweb.app.domain.comment.dto.CreateWatchCommentRequest;
import com.watchweb.app.domain.comment.service.PostCommentService;
import com.watchweb.app.domain.comment.service.WatchCommentService;
import com.watchweb.app.domain.post.dto.CreatePostRequest;
import com.watchweb.app.domain.post.service.PostModerationService;
import com.watchweb.app.domain.post.service.PostService;
import com.watchweb.app.domain.review.dto.CreateReviewRequest;
import com.watchweb.app.domain.review.service.ReviewService;
import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.entity.User;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.domain.watch.dto.CreateWatchSubmissionRequest;
import com.watchweb.app.domain.watch.dto.WatchDetailsRequest;
import com.watchweb.app.domain.watch.entity.MovementType;
import com.watchweb.app.domain.watch.entity.Watch;
import com.watchweb.app.domain.watch.repository.WatchRepository;
import com.watchweb.app.domain.watch.service.WatchNameNormalizer;
import com.watchweb.app.domain.watch.service.WatchSubmissionModerationService;
import com.watchweb.app.domain.watch.service.WatchSubmissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.dev-seed", name = "enabled", havingValue = "true", matchIfMissing = true)
public class DevDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);
    private static final String DEMO_PASSWORD = "Password123";
    private static final String ADMIN_EMAIL = "admin@watchweb.local";

    private final UserRepository userRepository;
    private final WatchRepository watchRepository;
    private final WatchNameNormalizer watchNameNormalizer;
    private final PasswordEncoder passwordEncoder;
    private final ArticleService articleService;
    private final ReviewService reviewService;
    private final PostService postService;
    private final PostModerationService postModerationService;
    private final WatchSubmissionService watchSubmissionService;
    private final WatchSubmissionModerationService watchSubmissionModerationService;
    private final WatchCommentService watchCommentService;
    private final PostCommentService postCommentService;

    public DevDataSeeder(
            UserRepository userRepository,
            WatchRepository watchRepository,
            WatchNameNormalizer watchNameNormalizer,
            PasswordEncoder passwordEncoder,
            ArticleService articleService,
            ReviewService reviewService,
            PostService postService,
            PostModerationService postModerationService,
            WatchSubmissionService watchSubmissionService,
            WatchSubmissionModerationService watchSubmissionModerationService,
            WatchCommentService watchCommentService,
            PostCommentService postCommentService
    ) {
        this.userRepository = userRepository;
        this.watchRepository = watchRepository;
        this.watchNameNormalizer = watchNameNormalizer;
        this.passwordEncoder = passwordEncoder;
        this.articleService = articleService;
        this.reviewService = reviewService;
        this.postService = postService;
        this.postModerationService = postModerationService;
        this.watchSubmissionService = watchSubmissionService;
        this.watchSubmissionModerationService = watchSubmissionModerationService;
        this.watchCommentService = watchCommentService;
        this.postCommentService = postCommentService;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail(ADMIN_EMAIL)) {
            return;
        }

        var admin = createUser("demo-admin", ADMIN_EMAIL, Role.ROLE_ADMIN);
        var moderator = createUser("demo-moderator", "moderator@watchweb.local", Role.ROLE_MODERATOR);
        var journalist = createUser("demo-journalist", "journalist@watchweb.local", Role.ROLE_JOURNALIST);
        var user = createUser("demo-user", "user@watchweb.local", Role.ROLE_USER);
        var collector = createUser("demo-collector", "collector@watchweb.local", Role.ROLE_USER);

        var alpinist = createCatalogWatch(
                "Seiko",
                "Alpinist SPB121",
                "SPB121J1",
                MovementType.AUTOMATIC,
                "6R35",
                "39.50",
                "13.20",
                "46.40",
                "20.00",
                200,
                "Sapphire",
                "Stainless steel"
        );
        var blackBay = createCatalogWatch(
                "Tudor",
                "Black Bay 58",
                "M79030N-0001",
                MovementType.AUTOMATIC,
                "MT5402",
                "39.00",
                "11.90",
                "47.00",
                "20.00",
                200,
                "Sapphire",
                "Stainless steel"
        );
        var speedmaster = createCatalogWatch(
                "Omega",
                "Speedmaster Professional",
                "310.30.42.50.01.002",
                MovementType.MANUAL,
                "3861",
                "42.00",
                "13.20",
                "47.50",
                "20.00",
                50,
                "Hesalite",
                "Stainless steel"
        );
        var gShock = createCatalogWatch(
                "Casio",
                "G-Shock DW-5600",
                "DW-5600E-1VER",
                MovementType.QUARTZ,
                "Module 3229",
                "42.80",
                "13.40",
                "48.90",
                "16.00",
                200,
                "Mineral",
                "Resin"
        );

        createReviews(user, collector, moderator, alpinist, blackBay, speedmaster, gShock);
        createWatchComments(user, collector, alpinist);
        createPosts(user, collector);
        createArticles(journalist);
        createWatchSubmissions(user);

        log.info("WatchWeb dev seed loaded. Demo password for all seeded users: {}", DEMO_PASSWORD);
        log.info("Demo users: {}", List.of(admin.getEmail(), moderator.getEmail(), journalist.getEmail(), user.getEmail(), collector.getEmail()));
    }

    private User createUser(String username, String email, Role role) {
        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.saveAndFlush(new User(
                        username,
                        email,
                        passwordEncoder.encode(DEMO_PASSWORD),
                        role
                )));
    }

    private Watch createCatalogWatch(
            String brand,
            String model,
            String referenceCode,
            MovementType movementType,
            String caliber,
            String caseDiameterMm,
            String caseThicknessMm,
            String lugToLugMm,
            String strapWidthMm,
            int waterResistanceM,
            String crystalType,
            String caseMaterial
    ) {
        var brandNormalized = watchNameNormalizer.normalize(brand);
        var modelNormalized = watchNameNormalizer.normalize(model);

        return watchRepository.findByBrandNormalizedAndModelNormalized(brandNormalized, modelNormalized)
                .orElseGet(() -> watchRepository.saveAndFlush(new Watch(
                        brand,
                        model,
                        referenceCode,
                        brandNormalized,
                        modelNormalized,
                        new WatchDetailsRequest(
                                movementType,
                                caliber,
                                new BigDecimal(caseDiameterMm),
                                new BigDecimal(caseThicknessMm),
                                new BigDecimal(lugToLugMm),
                                new BigDecimal(strapWidthMm),
                                waterResistanceM,
                                crystalType,
                                caseMaterial
                        ).toEntity()
                )));
    }

    private void createReviews(User user, User collector, User moderator, Watch alpinist, Watch blackBay, Watch speedmaster, Watch gShock) {
        reviewService.create(alpinist.getId(), user.getId(), new CreateReviewRequest(9, "Great everyday field watch with a very comfortable case size."));
        reviewService.create(alpinist.getId(), collector.getId(), new CreateReviewRequest(8, "The green dial is excellent, although the bracelet could be better."));
        reviewService.create(blackBay.getId(), collector.getId(), new CreateReviewRequest(9, "Compact diver with strong finishing and a reliable movement."));
        reviewService.create(speedmaster.getId(), moderator.getId(), new CreateReviewRequest(10, "A classic chronograph that still feels special on the wrist."));
        reviewService.create(gShock.getId(), user.getId(), new CreateReviewRequest(8, "Simple, durable and easy to recommend as a practical digital watch."));
    }

    private void createWatchComments(User user, User collector, Watch watch) {
        var root = watchCommentService.create(
                watch.getId(),
                collector.getId(),
                new CreateWatchCommentRequest(null, "This one wears smaller than the numbers suggest.")
        );
        watchCommentService.create(
                watch.getId(),
                user.getId(),
                new CreateWatchCommentRequest(root.id(), "Agreed, the lug-to-lug makes a big difference.")
        );
    }

    private void createPosts(User user, User collector) {
        var approvedPost = postService.create(
                user.getId(),
                new CreatePostRequest(
                        "First month with the Seiko Alpinist",
                        "After wearing it daily, I think the case size and dial texture are the best parts of this watch.",
                        List.of("seiko", "alpinist", "dailywatch")
                )
        );
        postModerationService.approve(approvedPost.id());

        var secondApprovedPost = postService.create(
                collector.getId(),
                new CreatePostRequest(
                        "Why I still like quartz watches",
                        "Mechanical watches are fun, but a reliable quartz watch is hard to beat for travel and everyday use.",
                        List.of("quartz", "casio", "collecting")
                )
        );
        postModerationService.approve(secondApprovedPost.id());

        var pendingPost = postService.create(
                user.getId(),
                new CreatePostRequest(
                        "Strap ideas for a diver",
                        "I am testing rubber, NATO and bracelet options before writing a longer update.",
                        List.of("straps", "diver")
                )
        );

        var rejectedPost = postService.create(
                collector.getId(),
                new CreatePostRequest(
                        "Too short post",
                        "Need to add more details later.",
                        List.of("draft")
                )
        );
        postModerationService.reject(rejectedPost.id(), "Please add more details before publishing.");

        var root = postCommentService.create(
                approvedPost.id(),
                collector.getId(),
                new CreatePostCommentRequest(null, "Nice write-up. How is the bracelet after a full day?")
        );
        postCommentService.create(
                approvedPost.id(),
                user.getId(),
                new CreatePostCommentRequest(root.id(), "Good enough, but I prefer it on leather.")
        );

        log.info("Demo pending post id: {}", pendingPost.id());
    }

    private void createArticles(User journalist) {
        articleService.create(
                journalist.getId(),
                new CreateArticleRequest(
                        "How microbrands changed modern collecting",
                        "Smaller brands made unusual case shapes, direct communication and limited production runs much more accessible to collectors."
                )
        );
        articleService.create(
                journalist.getId(),
                new CreateArticleRequest(
                        "A beginner guide to movement types",
                        "Quartz, manual and automatic movements solve the same problem in different ways. Understanding the trade-offs helps new collectors buy with more confidence."
                )
        );
    }

    private void createWatchSubmissions(User user) {
        var pendingSubmission = watchSubmissionService.submit(
                user.getId(),
                createSubmissionRequest("Lorier", "Neptune IV", "NEPTUNE-IV")
        );
        var rejectedSubmission = watchSubmissionService.submit(
                user.getId(),
                createSubmissionRequest("Baltic", "MR01", "MR01-SALMON")
        );
        watchSubmissionModerationService.reject(rejectedSubmission.id(), "Demo rejection: reference details should be verified.");

        log.info("Demo pending watch submission id: {}", pendingSubmission.id());
    }

    private CreateWatchSubmissionRequest createSubmissionRequest(String brand, String model, String referenceCode) {
        return new CreateWatchSubmissionRequest(
                brand,
                model,
                referenceCode,
                new WatchDetailsRequest(
                        MovementType.AUTOMATIC,
                        "Demo caliber",
                        new BigDecimal("39.00"),
                        new BigDecimal("12.00"),
                        new BigDecimal("47.00"),
                        new BigDecimal("20.00"),
                        100,
                        "Sapphire",
                        "Stainless steel"
                )
        );
    }
}
