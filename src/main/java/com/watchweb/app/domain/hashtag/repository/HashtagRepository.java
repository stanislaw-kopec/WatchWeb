package com.watchweb.app.domain.hashtag.repository;

import com.watchweb.app.domain.hashtag.entity.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface HashtagRepository extends JpaRepository<Hashtag, UUID> {

    Optional<Hashtag> findByName(String name);
}
