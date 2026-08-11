package com.watchweb.app;

import com.watchweb.app.domain.auth.dto.RegisterRequest;
import com.watchweb.app.domain.auth.service.AuthService;
import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.entity.User;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.DuplicateResourceException;
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
}
