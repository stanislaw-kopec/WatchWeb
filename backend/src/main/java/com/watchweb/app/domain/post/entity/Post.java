package com.watchweb.app.domain.post.entity;

import com.watchweb.app.domain.hashtag.entity.Hashtag;
import com.watchweb.app.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import org.hibernate.annotations.BatchSize;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PostStatus status;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @ManyToMany
    @BatchSize(size = 50)
    @JoinTable(
            name = "post_hashtags",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "hashtag_id")
    )
    private Set<Hashtag> hashtags = new LinkedHashSet<>();

    protected Post() {
    }

    public Post(User author, String title, String content) {
        this.author = author;
        this.title = title;
        this.content = content;
        this.status = PostStatus.PENDING;
    }

    @PrePersist
    void prePersist() {
        var now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public User getAuthor() {
        return author;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public PostStatus getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public Set<Hashtag> getHashtags() {
        return hashtags;
    }

    public void approve() {
        status = PostStatus.APPROVED;
        rejectionReason = null;
    }

    public void reject(String reason) {
        status = PostStatus.REJECTED;
        rejectionReason = reason;
    }

    public void updateByAuthor(String title, String content) {
        this.title = title;
        this.content = content;
        status = PostStatus.PENDING;
        rejectionReason = null;
    }

    public void replaceHashtags(Set<Hashtag> hashtags) {
        this.hashtags.clear();
        this.hashtags.addAll(hashtags);
    }

    public void updateImageByAuthor(String imageUrl) {
        this.imageUrl = imageUrl;
        status = PostStatus.PENDING;
        rejectionReason = null;
    }

    public void softDelete() {
        deletedAt = Instant.now();
    }

    public boolean isPending() {
        return status == PostStatus.PENDING;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Post post)) {
            return false;
        }
        return id != null && Objects.equals(id, post.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
