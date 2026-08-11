package com.watchweb.app.domain.watch.entity;

import com.watchweb.app.domain.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "watch_submissions")
public class WatchSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submitted_by_id", nullable = false)
    private User submittedBy;

    @Column(nullable = false, length = 100)
    private String brand;

    @Column(nullable = false, length = 150)
    private String model;

    @Column(name = "reference_code", length = 100)
    private String referenceCode;

    @Column(name = "brand_normalized", nullable = false, length = 100)
    private String brandNormalized;

    @Column(name = "model_normalized", nullable = false, length = 150)
    private String modelNormalized;

    @Embedded
    private WatchDetails details;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private WatchSubmissionStatus status;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected WatchSubmission() {
    }

    public WatchSubmission(
            User submittedBy,
            String brand,
            String model,
            String referenceCode,
            String brandNormalized,
            String modelNormalized,
            WatchDetails details
    ) {
        this.submittedBy = submittedBy;
        this.brand = brand;
        this.model = model;
        this.referenceCode = referenceCode;
        this.brandNormalized = brandNormalized;
        this.modelNormalized = modelNormalized;
        this.details = details;
        this.status = WatchSubmissionStatus.PENDING;
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

    public User getSubmittedBy() {
        return submittedBy;
    }

    public String getBrand() {
        return brand;
    }

    public String getModel() {
        return model;
    }

    public String getReferenceCode() {
        return referenceCode;
    }

    public String getBrandNormalized() {
        return brandNormalized;
    }

    public String getModelNormalized() {
        return modelNormalized;
    }

    public WatchDetails getDetails() {
        return details;
    }

    public WatchSubmissionStatus getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof WatchSubmission submission)) {
            return false;
        }
        return id != null && Objects.equals(id, submission.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
