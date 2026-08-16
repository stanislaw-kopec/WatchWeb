package com.watchweb.app.infrastructure.storage;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Stored file metadata")
public record StoredFile(
        @Schema(description = "Logical storage folder", example = "avatars")
        String folder,

        @Schema(description = "Stored file name", example = "7c2a9d51-2eb5-4667-8a74-4710fdfef8cd.jpg")
        String filename,

        @Schema(description = "Public URL path for downloading the file", example = "/api/files/avatars/7c2a9d51-2eb5-4667-8a74-4710fdfef8cd.jpg")
        String url,

        @Schema(description = "File content type", example = "image/jpeg")
        String contentType,

        @Schema(description = "File size in bytes", example = "120540")
        long size
) {
}
