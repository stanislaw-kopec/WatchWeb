CREATE TABLE articles (
    id UUID PRIMARY KEY,
    author_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    deleted_at TIMESTAMP(6) WITH TIME ZONE,
    CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES app_users (id)
);

CREATE INDEX idx_articles_author_id ON articles (author_id);
CREATE INDEX idx_articles_created_at ON articles (created_at);
CREATE INDEX idx_articles_deleted_at ON articles (deleted_at);
