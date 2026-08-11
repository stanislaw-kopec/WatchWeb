package com.watchweb.app.domain.watch.service;

import com.watchweb.app.domain.watch.dto.WatchResponse;
import com.watchweb.app.domain.watch.repository.WatchRepository;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class WatchCatalogService {

    private final WatchRepository watchRepository;

    public WatchCatalogService(WatchRepository watchRepository) {
        this.watchRepository = watchRepository;
    }

    @Transactional(readOnly = true)
    public Page<WatchResponse> list(Pageable pageable) {
        return watchRepository.findAll(pageable)
                .map(WatchResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public WatchResponse getById(UUID id) {
        return watchRepository.findById(id)
                .map(WatchResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Watch not found: " + id));
    }
}
