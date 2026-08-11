ALTER TABLE watches
    ADD COLUMN average_rating NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN reviews_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE reviews (
    id UUID PRIMARY KEY,
    watch_id UUID NOT NULL,
    reviewer_id UUID NOT NULL,
    rating INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_reviews_watch FOREIGN KEY (watch_id) REFERENCES watches (id),
    CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_id) REFERENCES app_users (id),
    CONSTRAINT uk_reviews_watch_reviewer UNIQUE (watch_id, reviewer_id),
    CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 10)
);

CREATE INDEX idx_reviews_watch_id ON reviews (watch_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews (reviewer_id);
