package com.watchweb.app.config;

import com.watchweb.app.infrastructure.storage.LocalStorageProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(LocalStorageProperties.class)
public class StorageConfig {
}
