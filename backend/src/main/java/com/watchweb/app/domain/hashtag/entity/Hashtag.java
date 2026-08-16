package com.watchweb.app.domain.hashtag.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(
        name = "hashtags",
        uniqueConstraints = @UniqueConstraint(name = "uk_hashtags_name", columnNames = "name")
)
public class Hashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Hashtag() {
    }

    public Hashtag(String name) {
        this.name = name;
    }

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Hashtag hashtag)) {
            return false;
        }
        return id != null && Objects.equals(id, hashtag.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
