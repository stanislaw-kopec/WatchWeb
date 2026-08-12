package com.watchweb.app.domain.hashtag.service;

import com.watchweb.app.domain.hashtag.dto.HashtagResponse;
import com.watchweb.app.domain.hashtag.entity.Hashtag;
import com.watchweb.app.domain.hashtag.repository.HashtagRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
public class HashtagService {

    private final HashtagRepository hashtagRepository;
    private final HashtagNameNormalizer hashtagNameNormalizer;

    public HashtagService(HashtagRepository hashtagRepository, HashtagNameNormalizer hashtagNameNormalizer) {
        this.hashtagRepository = hashtagRepository;
        this.hashtagNameNormalizer = hashtagNameNormalizer;
    }

    @Transactional
    public Set<Hashtag> resolve(List<String> rawNames) {
        if (rawNames == null || rawNames.isEmpty()) {
            return Set.of();
        }

        var normalizedNames = new LinkedHashSet<String>();
        for (var rawName : rawNames) {
            var normalizedName = hashtagNameNormalizer.normalize(rawName);
            if (!normalizedName.isBlank()) {
                normalizedNames.add(normalizedName);
            }
        }

        var hashtags = new LinkedHashSet<Hashtag>();
        for (var normalizedName : normalizedNames) {
            hashtags.add(findOrCreate(normalizedName));
        }
        return hashtags;
    }

    @Transactional(readOnly = true)
    public Page<HashtagResponse> list(String query, Pageable pageable) {
        var normalizedQuery = hashtagNameNormalizer.normalize(query);

        if (query == null || query.isBlank()) {
            return hashtagRepository.findAll(pageable)
                    .map(HashtagResponse::fromEntity);
        }

        if (normalizedQuery.isBlank()) {
            return Page.empty(pageable);
        }

        return hashtagRepository.findByNameStartingWith(normalizedQuery, pageable)
                .map(HashtagResponse::fromEntity);
    }

    private Hashtag findOrCreate(String name) {
        return hashtagRepository.findByName(name)
                .orElseGet(() -> create(name));
    }

    private Hashtag create(String name) {
        try {
            return hashtagRepository.saveAndFlush(new Hashtag(name));
        } catch (DataIntegrityViolationException exception) {
            return hashtagRepository.findByName(name)
                    .orElseThrow(() -> exception);
        }
    }
}
