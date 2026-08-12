package com.watchweb.app.domain.user.service;

import com.watchweb.app.domain.user.dto.UserResponse;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.ResourceNotFoundException;
import com.watchweb.app.infrastructure.storage.StorageFolder;
import com.watchweb.app.infrastructure.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    public UserResponse updateAvatar(UUID userId, MultipartFile file) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        var storedFile = storageService.store(file, StorageFolder.AVATARS);
        user.updateAvatarUrl(storedFile.url());

        return UserResponse.fromEntity(userRepository.saveAndFlush(user));
    }
}
