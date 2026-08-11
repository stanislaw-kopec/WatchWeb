package com.watchweb.app.domain.watch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "watches")
public class Watch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

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

    @Column(name = "average_rating", nullable = false, precision = 4, scale = 2)
    private BigDecimal averageRating = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

    @Column(name = "reviews_count", nullable = false)
    private int reviewsCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Watch() {
    }

    public Watch(String brand, String model, String referenceCode, String brandNormalized, String modelNormalized, WatchDetails details) {
        this.brand = brand;
        this.model = model;
        this.referenceCode = referenceCode;
        this.brandNormalized = brandNormalized;
        this.modelNormalized = modelNormalized;
        this.details = details;
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

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public int getReviewsCount() {
        return reviewsCount;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void addReviewRating(int rating) {
        var totalRating = averageRating.multiply(BigDecimal.valueOf(reviewsCount))
                .add(BigDecimal.valueOf(rating));
        reviewsCount++;
        averageRating = totalRating.divide(BigDecimal.valueOf(reviewsCount), 2, RoundingMode.HALF_UP);
    }

    public void updateReviewRating(int oldRating, int newRating) {
        var totalRating = averageRating.multiply(BigDecimal.valueOf(reviewsCount))
                .subtract(BigDecimal.valueOf(oldRating))
                .add(BigDecimal.valueOf(newRating));
        averageRating = totalRating.divide(BigDecimal.valueOf(reviewsCount), 2, RoundingMode.HALF_UP);
    }

    public void removeReviewRating(int rating) {
        if (reviewsCount <= 1) {
            reviewsCount = 0;
            averageRating = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
            return;
        }

        var totalRating = averageRating.multiply(BigDecimal.valueOf(reviewsCount))
                .subtract(BigDecimal.valueOf(rating));
        reviewsCount--;
        averageRating = totalRating.divide(BigDecimal.valueOf(reviewsCount), 2, RoundingMode.HALF_UP);
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof Watch watch)) {
            return false;
        }
        return id != null && Objects.equals(id, watch.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
