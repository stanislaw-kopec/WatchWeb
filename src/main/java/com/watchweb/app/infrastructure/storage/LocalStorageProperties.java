package com.watchweb.app.infrastructure.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;

@ConfigurationProperties(prefix = "app.storage.local")
public record LocalStorageProperties(
        String basePath,
        DataSize maxFileSize
) {
}
