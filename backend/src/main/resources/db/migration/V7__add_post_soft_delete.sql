ALTER TABLE posts
    ADD COLUMN deleted_at TIMESTAMP(6) WITH TIME ZONE;

CREATE INDEX idx_posts_deleted_at ON posts (deleted_at);
