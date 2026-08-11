package com.watchweb.app;

import com.watchweb.app.domain.auth.dto.RegisterRequest;
import com.watchweb.app.domain.auth.dto.LoginRequest;
import com.watchweb.app.domain.auth.dto.RefreshTokenRequest;
import com.watchweb.app.domain.auth.service.AuthService;
import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.entity.User;
import com.watchweb.app.domain.user.repository.UserRepository;
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
}
