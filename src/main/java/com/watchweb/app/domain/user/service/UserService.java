package com.watchweb.app.domain.user.service;

import com.watchweb.app.domain.user.dto.UpdateUserProfileRequest;
import com.watchweb.app.domain.user.dto.UserResponse;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.DuplicateResourceException;
import com.watchweb.app.exception.ResourceNotFoundException;
import com.watchweb.app.infrastructure.storage.StorageFolder;
import com.watchweb.app.infrastructure.storage.StorageService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StorageService storageService;

    public UserService(UserRepository userRepository, StorageService storageService) {
        this.userRepository = userRepository;
        this.storageService = storageService;
    }

    @Transactional(readOnly = true)
    public UserResponse getUser(UUID id) {
        return userRepository.findById(id)
                .map(UserResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateUserProfileRequest request) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        var username = request.username().trim();
        var email = request.email().trim().toLowerCase(Locale.ROOT);

        validateUniqueUsername(user.getUsername(), username);
        validateUniqueEmail(user.getEmail(), email);

        user.updateProfile(username, email);

        try {
            return UserResponse.fromEntity(userRepository.saveAndFlush(user));
        } catch (DataIntegrityViolationException exception) {
            throw new DuplicateResourceException("User with this username or email already exists");
        }
    }

    @Transactional
    public UserResponse updateAvatar(UUID userId, MultipartFile file) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        var storedFile = storageService.store(file, StorageFolder.AVATARS);
        user.updateAvatarUrl(storedFile.url());

        return UserResponse.fromEntity(userRepository.saveAndFlush(user));
    }

    private void validateUniqueUsername(String currentUsername, String newUsername) {
        if (!currentUsername.equals(newUsername) && userRepository.existsByUsername(newUsername)) {
            throw new DuplicateResourceException("Username is already taken");
        }
    }

    private void validateUniqueEmail(String currentEmail, String newEmail) {
        if (!currentEmail.equals(newEmail) && userRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("Email is already taken");
        }
    }
}
