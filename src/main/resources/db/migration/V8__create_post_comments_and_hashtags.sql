CREATE TABLE post_comments (
    id UUID PRIMARY KEY,
    post_id UUID NOT NULL,
    author_id UUID NOT NULL,
    parent_id UUID,
    content TEXT NOT NULL,
    depth INTEGER NOT NULL,
    deleted_at TIMESTAMP(6) WITH TIME ZONE,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_post_comments_post FOREIGN KEY (post_id) REFERENCES posts (id),
    CONSTRAINT fk_post_comments_author FOREIGN KEY (author_id) REFERENCES app_users (id),
    CONSTRAINT fk_post_comments_parent FOREIGN KEY (parent_id) REFERENCES post_comments (id),
    CONSTRAINT chk_post_comments_depth CHECK (depth BETWEEN 1 AND 3)
);

CREATE INDEX idx_post_comments_post_id ON post_comments (post_id);
CREATE INDEX idx_post_comments_parent_id ON post_comments (parent_id);
CREATE INDEX idx_post_comments_created_at ON post_comments (created_at);

CREATE TABLE hashtags (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_hashtags_name UNIQUE (name)
);

CREATE TABLE post_hashtags (
    post_id UUID NOT NULL,
    hashtag_id UUID NOT NULL,
    CONSTRAINT pk_post_hashtags PRIMARY KEY (post_id, hashtag_id),
    CONSTRAINT fk_post_hashtags_post FOREIGN KEY (post_id) REFERENCES posts (id),
    CONSTRAINT fk_post_hashtags_hashtag FOREIGN KEY (hashtag_id) REFERENCES hashtags (id)
);

CREATE INDEX idx_post_hashtags_hashtag_id ON post_hashtags (hashtag_id);
