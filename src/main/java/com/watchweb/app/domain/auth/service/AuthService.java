package com.watchweb.app.domain.auth.service;

import com.watchweb.app.domain.auth.dto.RegisterRequest;
import com.watchweb.app.domain.auth.dto.RegisterResponse;
import com.watchweb.app.domain.user.dto.UserResponse;
import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.entity.User;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.DuplicateResourceException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
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
