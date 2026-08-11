package com.watchweb.app.infrastructure.storage;

public enum StorageFolder {
    AVATARS("avatars"),
    POST_IMAGES("post-images"),
    ARTICLE_IMAGES("article-images");

    private final String path;

    StorageFolder(String path) {
        this.path = path;
    }

    public String path() {
        return path;
    }
}
