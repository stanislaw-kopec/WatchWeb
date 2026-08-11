package com.watchweb.app;

import com.watchweb.app.domain.auth.dto.RegisterRequest;
import com.watchweb.app.domain.auth.dto.LoginRequest;
import com.watchweb.app.domain.auth.dto.RefreshTokenRequest;
import com.watchweb.app.domain.auth.service.AuthService;
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
import com.watchweb.app.domain.watch.service.WatchSubmissionService;
import com.watchweb.app.exception.DuplicateResourceException;
import com.watchweb.app.exception.InvalidCredentialsException;
import com.watchweb.app.security.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;

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
}
