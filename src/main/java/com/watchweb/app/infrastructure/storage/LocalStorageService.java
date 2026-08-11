package com.watchweb.app.infrastructure.storage;

import com.watchweb.app.exception.BadRequestException;
import com.watchweb.app.exception.ResourceNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Map<String, String> EXTENSIONS_BY_CONTENT_TYPE = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final Path basePath;
    private final long maxFileSizeBytes;

    public LocalStorageService(LocalStorageProperties properties) {
        this.basePath = Path.of(properties.basePath()).toAbsolutePath().normalize();
        this.maxFileSizeBytes = properties.maxFileSize().toBytes();
    }

    @Override
    public StoredFile store(MultipartFile file, StorageFolder folder) {
        validate(file);

        var contentType = file.getContentType();
        var extension = EXTENSIONS_BY_CONTENT_TYPE.get(contentType);
        var filename = UUID.randomUUID() + extension;
        var targetDirectory = resolveFolder(folder.path());
        var targetPath = targetDirectory.resolve(filename).normalize();

        ensureInsideBasePath(targetPath);

        try {
            Files.createDirectories(targetDirectory);
            file.transferTo(targetPath);
        } catch (IOException exception) {
            throw new UncheckedIOException("Could not store file", exception);
        }

        return new StoredFile(
                folder.path(),
                filename,
                "/api/files/" + folder.path() + "/" + filename,
                contentType,
                file.getSize()
        );
    }

    @Override
    public Resource load(String folder, String filename) {
        if (folder == null || folder.isBlank() || filename == null || filename.isBlank()) {
            throw new ResourceNotFoundException("File not found");
        }

        var filePath = resolveFolder(folder).resolve(filename).normalize();
        ensureInsideBasePath(filePath);

        if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            throw new ResourceNotFoundException("File not found");
        }

        try {
            return new UrlResource(filePath.toUri());
        } catch (MalformedURLException exception) {
            throw new ResourceNotFoundException("File not found");
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is required");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new BadRequestException("File size must not exceed 5 MB");
        }

        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPG, PNG and WEBP files are allowed");
        }
    }

    private Path resolveFolder(String folder) {
        var folderPath = basePath.resolve(folder).normalize();
        ensureInsideBasePath(folderPath);
        return folderPath;
    }

    private void ensureInsideBasePath(Path path) {
        if (!path.startsWith(basePath)) {
            throw new ResourceNotFoundException("File not found");
        }
    }
}
