ALTER TABLE posts
    DROP CONSTRAINT chk_posts_status,
    ADD CONSTRAINT chk_posts_status CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED'));

CREATE INDEX idx_posts_author_status_updated_at ON posts (author_id, status, updated_at DESC);
