package com.watchweb.app.infrastructure.storage;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {

    StoredFile store(MultipartFile file, StorageFolder folder);

    Resource load(String folder, String filename);
}
