package com.watchweb.app.domain.user.service;

import com.watchweb.app.domain.user.dto.UpdateUserRoleRequest;
import com.watchweb.app.domain.user.dto.UserResponse;
import com.watchweb.app.domain.user.entity.Role;
import com.watchweb.app.domain.user.repository.UserRepository;
import com.watchweb.app.exception.InvalidOperationException;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class UserAdminService {

    private final UserRepository userRepository;

    public UserAdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> list(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(UserResponse::fromEntity);
    }

    @Transactional
    public UserResponse updateRole(UUID userId, UUID currentAdminId, UpdateUserRoleRequest request) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        if (user.getId().equals(currentAdminId) && request.role() != Role.ROLE_ADMIN) {
            throw new InvalidOperationException("Admin cannot remove their own admin role");
        }

        user.updateRole(request.role());
        return UserResponse.fromEntity(userRepository.saveAndFlush(user));
    }
}
