package com.watchweb.app.domain.auth.service;

import com.watchweb.app.domain.auth.dto.AuthResponse;
import com.watchweb.app.domain.auth.dto.LoginRequest;
import com.watchweb.app.domain.auth.dto.LogoutRequest;
import com.watchweb.app.domain.auth.dto.RefreshTokenRequest;
import com.watchweb.app.domain.auth.dto.RegisterRequest;
import com.watchweb.app.domain.auth.dto.RegisterResponse;
import com.watchweb.app.domain.user.dto.UserResponse;
import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.entity.User;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.DuplicateResourceException;
import com.watchweb.app.exception.InvalidCredentialsException;
import com.watchweb.app.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        var username = request.username().trim();
        var email = request.email().trim().toLowerCase(Locale.ROOT);

        validateUniqueUsername(username);
        validateUniqueEmail(email);

        var user = new User(
                username,
                email,
                passwordEncoder.encode(request.password()),
                Role.ROLE_USER
        );

        try {
            return new RegisterResponse(UserResponse.fromEntity(userRepository.saveAndFlush(user)));
        } catch (DataIntegrityViolationException exception) {
            throw new DuplicateResourceException("User with this username or email already exists");
        }
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        var email = request.email().trim().toLowerCase(Locale.ROOT);
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        return createAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        var user = refreshTokenService.consumeRefreshToken(request.refreshToken());
        return createAuthResponse(user);
    }

    @Transactional
    public void logout(LogoutRequest request) {
        refreshTokenService.revokeRefreshToken(request.refreshToken());
    }

    private AuthResponse createAuthResponse(User user) {
        var accessToken = jwtService.generateAccessToken(user);
        var refreshToken = refreshTokenService.createRefreshToken(user);
        return AuthResponse.bearer(accessToken, refreshToken, UserResponse.fromEntity(user));
    }

    private void validateUniqueUsername(String username) {
        if (userRepository.existsByUsername(username)) {
            throw new DuplicateResourceException("Username is already taken");
        }
    }

    private void validateUniqueEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email is already taken");
        }
    }
}
