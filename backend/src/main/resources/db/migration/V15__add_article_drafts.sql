ALTER TABLE articles
    ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED',
    ADD COLUMN published_at TIMESTAMP(6) WITH TIME ZONE;

UPDATE articles
SET published_at = created_at
WHERE status = 'PUBLISHED';

ALTER TABLE articles
    ALTER COLUMN status DROP DEFAULT,
    ADD CONSTRAINT chk_articles_status CHECK (status IN ('DRAFT', 'PUBLISHED'));

CREATE INDEX idx_articles_author_status ON articles (author_id, status);
CREATE INDEX idx_articles_status_published_at ON articles (status, published_at DESC);
