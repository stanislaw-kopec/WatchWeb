CREATE TABLE posts (
    id UUID PRIMARY KEY,
    author_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    rejection_reason VARCHAR(500),
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_posts_author FOREIGN KEY (author_id) REFERENCES app_users (id),
    CONSTRAINT chk_posts_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_posts_author_id ON posts (author_id);
CREATE INDEX idx_posts_status ON posts (status);
CREATE INDEX idx_posts_created_at ON posts (created_at);
