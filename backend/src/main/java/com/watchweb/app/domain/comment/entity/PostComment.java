package com.watchweb.app.domain.comment.entity;

import com.watchweb.app.domain.post.entity.Post;
import com.watchweb.app.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "post_comments")
public class PostComment {

    public static final int MAX_DEPTH = 3;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private PostComment parent;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private int depth;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected PostComment() {
    }

    public PostComment(Post post, User author, PostComment parent, String content) {
        this.post = post;
        this.author = author;
        this.parent = parent;
        this.content = content;
        this.depth = parent == null ? 1 : parent.getDepth() + 1;
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

    public Post getPost() {
        return post;
    }

    public User getAuthor() {
        return author;
    }

    public PostComment getParent() {
        return parent;
    }

    public String getContent() {
        return content;
    }

    public int getDepth() {
        return depth;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void softDelete() {
        deletedAt = Instant.now();
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof PostComment comment)) {
            return false;
        }
        return id != null && Objects.equals(id, comment.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
