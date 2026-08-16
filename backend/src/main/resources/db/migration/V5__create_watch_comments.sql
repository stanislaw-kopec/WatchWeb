CREATE TABLE watch_comments (
    id UUID PRIMARY KEY,
    watch_id UUID NOT NULL,
    author_id UUID NOT NULL,
    parent_id UUID,
    content TEXT NOT NULL,
    depth INTEGER NOT NULL,
    deleted_at TIMESTAMP(6) WITH TIME ZONE,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_watch_comments_watch FOREIGN KEY (watch_id) REFERENCES watches (id),
    CONSTRAINT fk_watch_comments_author FOREIGN KEY (author_id) REFERENCES app_users (id),
    CONSTRAINT fk_watch_comments_parent FOREIGN KEY (parent_id) REFERENCES watch_comments (id),
    CONSTRAINT chk_watch_comments_depth CHECK (depth BETWEEN 1 AND 3)
);

CREATE INDEX idx_watch_comments_watch_id ON watch_comments (watch_id);
CREATE INDEX idx_watch_comments_parent_id ON watch_comments (parent_id);
CREATE INDEX idx_watch_comments_author_id ON watch_comments (author_id);
