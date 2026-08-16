package com.watchweb.app.config;

import com.watchweb.app.domain.article.dto.CreateArticleRequest;
import com.watchweb.app.domain.article.repository.ArticleRepository;
import com.watchweb.app.domain.article.service.ArticleService;
import com.watchweb.app.domain.comment.dto.CreatePostCommentRequest;
import com.watchweb.app.domain.comment.dto.CreateWatchCommentRequest;
import com.watchweb.app.domain.comment.repository.PostCommentRepository;
import com.watchweb.app.domain.comment.repository.WatchCommentRepository;
import com.watchweb.app.domain.comment.service.PostCommentService;
import com.watchweb.app.domain.comment.service.WatchCommentService;
import com.watchweb.app.domain.post.dto.CreatePostRequest;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.repository.PostRepository;
import com.watchweb.app.domain.post.service.PostModerationService;
import com.watchweb.app.domain.post.service.PostService;
import com.watchweb.app.domain.review.dto.CreateReviewRequest;
import com.watchweb.app.domain.review.repository.ReviewRepository;
import com.watchweb.app.domain.review.service.ReviewService;
import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.entity.User;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.domain.watch.dto.CreateWatchSubmissionRequest;
import com.watchweb.app.domain.watch.dto.WatchDetailsRequest;
import com.watchweb.app.domain.watch.entity.MovementType;
import com.watchweb.app.domain.watch.entity.Watch;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import com.watchweb.app.domain.watch.repository.WatchRepository;
import com.watchweb.app.domain.watch.repository.WatchSubmissionRepository;
import com.watchweb.app.domain.watch.service.WatchNameNormalizer;
import com.watchweb.app.domain.watch.service.WatchSubmissionModerationService;
import com.watchweb.app.domain.watch.service.WatchSubmissionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
@Profile("dev")
@ConditionalOnProperty(prefix = "app.dev-seed", name = "enabled", havingValue = "true", matchIfMissing = true)
public class DevDataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);
    private static final String DEMO_PASSWORD = "Password123";

    private static final int TARGET_USERS = 40;
    private static final int TARGET_WATCHES = 100;
    private static final int TARGET_REVIEWS = 240;
    private static final int TARGET_WATCH_COMMENTS = 140;
    private static final int TARGET_POSTS = 70;
    private static final int TARGET_POST_COMMENTS = 120;
    private static final int TARGET_ARTICLES = 24;
    private static final int TARGET_WATCH_SUBMISSIONS = 24;

    private final UserRepository userRepository;
    private final WatchRepository watchRepository;
    private final WatchNameNormalizer watchNameNormalizer;
    private final PasswordEncoder passwordEncoder;
    private final ArticleRepository articleRepository;
    private final ArticleService articleService;
    private final ReviewRepository reviewRepository;
    private final ReviewService reviewService;
    private final PostRepository postRepository;
    private final PostService postService;
    private final PostModerationService postModerationService;
    private final WatchSubmissionRepository watchSubmissionRepository;
    private final WatchSubmissionService watchSubmissionService;
    private final WatchSubmissionModerationService watchSubmissionModerationService;
    private final WatchCommentRepository watchCommentRepository;
    private final WatchCommentService watchCommentService;
    private final PostCommentRepository postCommentRepository;
    private final PostCommentService postCommentService;

    public DevDataSeeder(
            UserRepository userRepository,
            WatchRepository watchRepository,
            WatchNameNormalizer watchNameNormalizer,
            PasswordEncoder passwordEncoder,
            ArticleRepository articleRepository,
            ArticleService articleService,
            ReviewRepository reviewRepository,
            ReviewService reviewService,
            PostRepository postRepository,
            PostService postService,
            PostModerationService postModerationService,
            WatchSubmissionRepository watchSubmissionRepository,
            WatchSubmissionService watchSubmissionService,
            WatchSubmissionModerationService watchSubmissionModerationService,
            WatchCommentRepository watchCommentRepository,
            WatchCommentService watchCommentService,
            PostCommentRepository postCommentRepository,
            PostCommentService postCommentService
    ) {
        this.userRepository = userRepository;
        this.watchRepository = watchRepository;
        this.watchNameNormalizer = watchNameNormalizer;
        this.passwordEncoder = passwordEncoder;
        this.articleRepository = articleRepository;
        this.articleService = articleService;
        this.reviewRepository = reviewRepository;
        this.reviewService = reviewService;
        this.postRepository = postRepository;
        this.postService = postService;
        this.postModerationService = postModerationService;
        this.watchSubmissionRepository = watchSubmissionRepository;
        this.watchSubmissionService = watchSubmissionService;
        this.watchSubmissionModerationService = watchSubmissionModerationService;
        this.watchCommentRepository = watchCommentRepository;
        this.watchCommentService = watchCommentService;
        this.postCommentRepository = postCommentRepository;
        this.postCommentService = postCommentService;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var users = seedUsers();
        var watches = seedCatalogWatches();

        seedReviews(users, watches);
        seedWatchComments(users, watches);
        seedPosts(users);
        seedPostComments(users);
        seedArticles(users);
        seedWatchSubmissions(users);

        log.info("WatchWeb dev seed loaded. Demo password for all seeded users: {}", DEMO_PASSWORD);
        log.info(
                "Dev seed totals: users={}, watches={}, reviews={}, watchComments={}, posts={}, postComments={}, articles={}, watchSubmissions={}",
                userRepository.count(),
                watchRepository.count(),
                reviewRepository.count(),
                watchCommentRepository.count(),
                postRepository.count(),
                postCommentRepository.count(),
                articleRepository.count(),
                watchSubmissionRepository.count()
        );
    }

    private List<User> seedUsers() {
        var users = new ArrayList<User>();
        users.add(createUser("demo-admin", "admin@watchweb.local", Role.ROLE_ADMIN));
        users.add(createUser("demo-moderator", "moderator@watchweb.local", Role.ROLE_MODERATOR));
        users.add(createUser("demo-journalist", "journalist@watchweb.local", Role.ROLE_JOURNALIST));
        users.add(createUser("demo-user", "user@watchweb.local", Role.ROLE_USER));
        users.add(createUser("demo-collector", "collector@watchweb.local", Role.ROLE_USER));

        for (int index = 1; users.size() < TARGET_USERS; index++) {
            users.add(createUser(
                    "demo-member-%02d".formatted(index),
                    "member%02d@watchweb.local".formatted(index),
                    demoRoleFor(index)
            ));
        }

        return users;
    }

    private Role demoRoleFor(int index) {
        if (index % 15 == 0) {
            return Role.ROLE_MODERATOR;
        }
        if (index % 6 == 0) {
            return Role.ROLE_JOURNALIST;
        }
        return Role.ROLE_USER;
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

    private List<Watch> seedCatalogWatches() {
        var watches = new ArrayList<Watch>();
        watches.add(createCatalogWatch(
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
        ));
        watches.add(createCatalogWatch(
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
        ));
        watches.add(createCatalogWatch(
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
        ));
        watches.add(createCatalogWatch(
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
        ));

        for (int index = 1; watches.size() < TARGET_WATCHES; index++) {
            watches.add(createGeneratedCatalogWatch(index));
        }

        return watches;
    }

    private Watch createGeneratedCatalogWatch(int index) {
        var brands = List.of(
                "Seiko", "Citizen", "Orient", "Tissot", "Hamilton", "Longines", "Certina", "Mido",
                "Oris", "Sinn", "Nomos", "Tudor", "Omega", "Doxa", "Squale", "Baltic",
                "Lorier", "Christopher Ward", "Farer", "Yema", "Casio", "Grand Seiko", "Rado", "Zodiac"
        );
        var families = List.of(
                "Field", "Diver", "Chronograph", "GMT", "Pilot", "Dress", "Explorer", "Sector",
                "Compressor", "Worldtimer", "Integrated", "Skin Diver"
        );
        var movements = List.of(
                MovementType.AUTOMATIC,
                MovementType.QUARTZ,
                MovementType.MANUAL,
                MovementType.SOLAR,
                MovementType.SPRING_DRIVE,
                MovementType.OTHER
        );
        var waterResistanceOptions = List.of(30, 50, 100, 150, 200, 300);

        var brand = brands.get((index - 1) % brands.size());
        var family = families.get((index - 1) % families.size());
        var model = "%s WW%03d".formatted(family, index);
        var movementType = movements.get((index - 1) % movements.size());
        var diameter = decimal(35.5 + (index % 17) * 0.5);
        var thickness = decimal(9.4 + (index % 11) * 0.35);
        var lugToLug = decimal(Double.parseDouble(diameter) + 7.8 + (index % 6) * 0.4);
        var strapWidth = index % 5 == 0 ? "22.00" : index % 3 == 0 ? "18.00" : "20.00";
        var waterResistance = waterResistanceOptions.get((index - 1) % waterResistanceOptions.size());
        var referenceCode = "%s-WW%03d".formatted(referencePrefix(brand), index);

        return createCatalogWatch(
                brand,
                model,
                referenceCode,
                movementType,
                "Caliber WW-%03d".formatted(index),
                diameter,
                thickness,
                lugToLug,
                strapWidth,
                waterResistance,
                index % 4 == 0 ? "Mineral" : "Sapphire",
                index % 9 == 0 ? "Titanium" : index % 7 == 0 ? "Bronze" : "Stainless steel"
        );
    }

    private String referencePrefix(String brand) {
        var normalized = brand.replaceAll("[^A-Za-z]", "").toUpperCase(Locale.ROOT);
        return normalized.substring(0, Math.min(4, normalized.length()));
    }

    private String decimal(double value) {
        return String.format(Locale.ROOT, "%.2f", value);
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

    private void seedReviews(List<User> users, List<Watch> watches) {
        var reviewers = users.stream()
                .filter(user -> user.getRole() != Role.ROLE_ADMIN)
                .toList();
        var count = reviewRepository.count();

        for (int round = 0; count < TARGET_REVIEWS && round < reviewers.size(); round++) {
            for (int watchIndex = 0; watchIndex < watches.size() && count < TARGET_REVIEWS; watchIndex++) {
                var watch = watches.get(watchIndex);
                var reviewer = reviewers.get((watchIndex + round * 11) % reviewers.size());

                if (reviewRepository.existsByWatchIdAndReviewerId(watch.getId(), reviewer.getId())) {
                    continue;
                }

                var rating = 6 + ((watchIndex + round) % 5);
                reviewService.create(
                        watch.getId(),
                        reviewer.getId(),
                        new CreateReviewRequest(rating, reviewContent(rating, watch))
                );
                count++;
            }
        }
    }

    private String reviewContent(int rating, Watch watch) {
        return switch (rating) {
            case 10 -> "Excellent finishing and a watch that feels special every time it is worn.";
            case 9 -> "Very strong everyday choice with balanced dimensions and a useful specification.";
            case 8 -> "A dependable watch with a few small compromises, but still easy to recommend.";
            case 7 -> "Good value and character, although the details could be sharper in places.";
            default -> "Interesting model for comparison, especially within the %s lineup.".formatted(watch.getBrand());
        };
    }

    private void seedWatchComments(List<User> users, List<Watch> watches) {
        var count = watchCommentRepository.count();
        var index = 0;

        while (count < TARGET_WATCH_COMMENTS) {
            var watch = watches.get(index % watches.size());
            var rootAuthor = users.get((index * 5 + 3) % users.size());
            var replyAuthor = users.get((index * 7 + 5) % users.size());
            var root = watchCommentService.create(
                    watch.getId(),
                    rootAuthor.getId(),
                    new CreateWatchCommentRequest(null, "How does this one wear compared with the case diameter?")
            );
            count++;

            if (count < TARGET_WATCH_COMMENTS && index % 2 == 0) {
                var reply = watchCommentService.create(
                        watch.getId(),
                        replyAuthor.getId(),
                        new CreateWatchCommentRequest(root.id(), "The lug-to-lug matters more than the diameter here.")
                );
                count++;

                if (count < TARGET_WATCH_COMMENTS && index % 6 == 0) {
                    watchCommentService.create(
                            watch.getId(),
                            rootAuthor.getId(),
                            new CreateWatchCommentRequest(reply.id(), "That helps, especially for smaller wrists.")
                    );
                    count++;
                }
            }

            index++;
        }
    }

    private void seedPosts(List<User> users) {
        var postTitles = List.of(
                "Daily wear notes after a week",
                "Bracelet sizing lessons",
                "Best travel watch setup",
                "Why dimensions can be misleading",
                "Strap rotation for the weekend",
                "Desk diver impressions",
                "A field watch in the city",
                "Quartz appreciation thread",
                "Small seconds dials and symmetry",
                "What makes a good clasp"
        );
        var hashtags = List.of(
                List.of("dailywatch", "collecting"),
                List.of("straps", "bracelet"),
                List.of("travel", "gmt"),
                List.of("dimensions", "fit"),
                List.of("diver", "weekend"),
                List.of("quartz", "casio"),
                List.of("fieldwatch", "seiko"),
                List.of("review", "ownership")
        );

        while (postRepository.count() < TARGET_POSTS) {
            var postNumber = (int) postRepository.count() + 1;
            var author = users.get((postNumber * 3) % users.size());
            var post = postService.create(
                    author.getId(),
                    new CreatePostRequest(
                            "%s #%02d".formatted(postTitles.get(postNumber % postTitles.size()), postNumber),
                            "Demo discussion content for WatchWeb feed item #%02d. It gives the frontend enough text to test cards, lists, search and moderation states.".formatted(postNumber),
                            hashtags.get(postNumber % hashtags.size())
                    )
            );

            if (postNumber % 10 == 0) {
                postModerationService.reject(post.id(), "Demo rejection: please add more specific ownership details.");
            } else if (postNumber % 4 != 0) {
                postModerationService.approve(post.id());
            }
        }
    }

    private void seedPostComments(List<User> users) {
        var count = postCommentRepository.count();
        var approvedPosts = postRepository.findByStatusAndDeletedAtIsNull(
                PostStatus.APPROVED,
                PageRequest.of(0, TARGET_POSTS)
        ).getContent();
        var index = 0;

        while (count < TARGET_POST_COMMENTS && !approvedPosts.isEmpty()) {
            var post = approvedPosts.get(index % approvedPosts.size());
            var rootAuthor = users.get((index * 7 + 2) % users.size());
            var replyAuthor = users.get((index * 9 + 4) % users.size());
            var root = postCommentService.create(
                    post.getId(),
                    rootAuthor.getId(),
                    new CreatePostCommentRequest(null, "Good point. I would like to see a longer ownership update later.")
            );
            count++;

            if (count < TARGET_POST_COMMENTS && index % 2 == 0) {
                postCommentService.create(
                        post.getId(),
                        replyAuthor.getId(),
                        new CreatePostCommentRequest(root.id(), "Same here, especially with more photos and sizing notes.")
                );
                count++;
            }

            index++;
        }
    }

    private void seedArticles(List<User> users) {
        var journalists = users.stream()
                .filter(user -> user.getRole() == Role.ROLE_JOURNALIST || user.getRole() == Role.ROLE_ADMIN)
                .toList();
        var topics = List.of(
                "How microbrands changed modern collecting",
                "A beginner guide to movement types",
                "Why case thickness changes wrist presence",
                "Integrated bracelet watches beyond the icons",
                "The return of compact divers",
                "GMT watches as practical travel tools",
                "How to read water resistance ratings",
                "Vintage-inspired design without copying the past"
        );

        while (articleRepository.count() < TARGET_ARTICLES) {
            var articleNumber = (int) articleRepository.count() + 1;
            var author = journalists.get(articleNumber % journalists.size());
            var topic = topics.get(articleNumber % topics.size());
            articleService.create(
                    author.getId(),
                    new CreateArticleRequest(
                            "%s #%02d".formatted(topic, articleNumber),
                            "Demo article body #%02d for WatchWeb. It gives the frontend enough editorial content to test article cards, listing pages and search results."
                                    .formatted(articleNumber)
                    )
            );
        }
    }

    private void seedWatchSubmissions(List<User> users) {
        while (watchSubmissionRepository.count() < TARGET_WATCH_SUBMISSIONS) {
            var submissionNumber = (int) watchSubmissionRepository.count() + 1;
            var submittedBy = users.get((submissionNumber * 5) % users.size());
            var submission = watchSubmissionService.submit(
                    submittedBy.getId(),
                    createSubmissionRequest(
                            "Submission Brand %02d".formatted((submissionNumber % 8) + 1),
                            "Candidate Model %02d".formatted(submissionNumber),
                            "SUB-%03d".formatted(submissionNumber),
                            submissionNumber
                    )
            );

            if (submissionNumber % 3 == 0) {
                watchSubmissionModerationService.reject(
                        submission.id(),
                        "Demo rejection: reference details should be verified."
                );
            }
        }

        ensureLegacyPendingSubmission(users.get(3));
    }

    private void ensureLegacyPendingSubmission(User submittedBy) {
        var brandNormalized = watchNameNormalizer.normalize("Lorier");
        var modelNormalized = watchNameNormalizer.normalize("Neptune IV");

        if (!watchSubmissionRepository.existsByBrandNormalizedAndModelNormalizedAndStatus(
                brandNormalized,
                modelNormalized,
                WatchSubmissionStatus.PENDING
        )) {
            watchSubmissionService.submit(
                    submittedBy.getId(),
                    createSubmissionRequest("Lorier", "Neptune IV", "NEPTUNE-IV", 1)
            );
        }
    }

    private CreateWatchSubmissionRequest createSubmissionRequest(
            String brand,
            String model,
            String referenceCode,
            int index
    ) {
        return new CreateWatchSubmissionRequest(
                brand,
                model,
                referenceCode,
                new WatchDetailsRequest(
                        MovementType.AUTOMATIC,
                        "Submission caliber %02d".formatted(index),
                        new BigDecimal(decimal(37.5 + (index % 10) * 0.5)),
                        new BigDecimal(decimal(10.5 + (index % 5) * 0.4)),
                        new BigDecimal(decimal(44.0 + (index % 8) * 0.7)),
                        new BigDecimal(index % 3 == 0 ? "18.00" : "20.00"),
                        index % 2 == 0 ? 200 : 100,
                        "Sapphire",
                        "Stainless steel"
                )
        );
    }
}
