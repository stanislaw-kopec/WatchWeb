package com.watchweb.app;

import com.watchweb.app.domain.article.repository.ArticleRepository;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.repository.PostRepository;
import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import com.watchweb.app.domain.watch.repository.WatchRepository;
import com.watchweb.app.domain.watch.repository.WatchSubmissionRepository;
import com.watchweb.app.domain.watch.service.WatchNameNormalizer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("dev")
@Testcontainers
class DevDataSeederIntegrationTest {

    private static final Path TEST_STORAGE_PATH = Path.of("target", "dev-seed-test-storage").toAbsolutePath();

    @Container
    private static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:18")
            .withDatabaseName("watchweb-dev-seed")
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
    private WatchRepository watchRepository;

    @Autowired
    private WatchSubmissionRepository watchSubmissionRepository;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private WatchNameNormalizer watchNameNormalizer;

    @Test
    void seedsDemoDataWhenDevProfileIsActive() {
        assertThat(userRepository.findByEmail("admin@watchweb.local"))
                .hasValueSatisfying(user -> assertThat(user.getRole()).isEqualTo(Role.ROLE_ADMIN));
        assertThat(userRepository.findByEmail("moderator@watchweb.local"))
                .hasValueSatisfying(user -> assertThat(user.getRole()).isEqualTo(Role.ROLE_MODERATOR));
        assertThat(userRepository.findByEmail("journalist@watchweb.local"))
                .hasValueSatisfying(user -> assertThat(user.getRole()).isEqualTo(Role.ROLE_JOURNALIST));
        assertThat(userRepository.findByEmail("user@watchweb.local"))
                .hasValueSatisfying(user -> assertThat(user.getRole()).isEqualTo(Role.ROLE_USER));

        assertThat(watchRepository.existsByBrandNormalizedAndModelNormalized(
                watchNameNormalizer.normalize("Seiko"),
                watchNameNormalizer.normalize("Alpinist SPB121")
        )).isTrue();

        assertThat(watchSubmissionRepository.existsByBrandNormalizedAndModelNormalizedAndStatus(
                watchNameNormalizer.normalize("Lorier"),
                watchNameNormalizer.normalize("Neptune IV"),
                WatchSubmissionStatus.PENDING
        )).isTrue();

        assertThat(postRepository.findByStatusAndDeletedAtIsNull(PostStatus.APPROVED, PageRequest.of(0, 10)).getContent())
                .hasSizeGreaterThanOrEqualTo(2);
        assertThat(articleRepository.findByDeletedAtIsNull(PageRequest.of(0, 10)).getContent())
                .hasSizeGreaterThanOrEqualTo(2);
    }
}
