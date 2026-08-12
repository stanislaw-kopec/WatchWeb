package com.watchweb.app.domain.auth.service;

import com.watchweb.app.domain.auth.entity.RefreshToken;
import com.watchweb.app.domain.auth.repository.RefreshTokenRepository;
import com.watchweb.app.domain.user.entity.User;
import com.watchweb.app.exception.InvalidCredentialsException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final long refreshTokenTtlDays;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            @Value("${app.security.refresh-token-ttl-days}") long refreshTokenTtlDays
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenTtlDays = refreshTokenTtlDays;
    }

    @Transactional
    public String createRefreshToken(User user) {
        var rawToken = generateRawToken();
        var tokenHash = hash(rawToken);
        var expiresAt = Instant.now().plus(refreshTokenTtlDays, ChronoUnit.DAYS);

        refreshTokenRepository.save(new RefreshToken(user, tokenHash, expiresAt));

        return rawToken;
    }

    @Transactional
    public User consumeRefreshToken(String rawToken) {
        var now = Instant.now();
        var refreshToken = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid refresh token"));

        if (!refreshToken.isActive(now)) {
            throw new InvalidCredentialsException("Invalid refresh token");
        }

        refreshToken.revoke(now);
        return refreshToken.getUser();
    }

    @Transactional
    public void revokeRefreshToken(String rawToken) {
        var now = Instant.now();
        var refreshToken = refreshTokenRepository.findByTokenHash(hash(rawToken))
                .orElseThrow(() -> new InvalidCredentialsException("Invalid refresh token"));

        if (!refreshToken.isActive(now)) {
            throw new InvalidCredentialsException("Invalid refresh token");
        }

        refreshToken.revoke(now);
    }

    private String generateRawToken() {
        var randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return UUID.randomUUID() + "." + HexFormat.of().formatHex(randomBytes);
    }

    private String hash(String rawToken) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }
}
