package com.watchweb.app.infrastructure.storage;

import com.watchweb.app.exception.ApiErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URLConnection;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Files", description = "Public access to locally stored files")
public class FileController {

    private final StorageService storageService;

    public FileController(StorageService storageService) {
        this.storageService = storageService;
    }

    @GetMapping("/{folder}/{filename:.+}")
    @Operation(summary = "Download file", description = "Returns a locally stored public file.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "File returned"),
            @ApiResponse(
                    responseCode = "404",
                    description = "File not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public ResponseEntity<Resource> download(
            @Parameter(description = "Storage folder", required = true, example = "avatars")
            @PathVariable String folder,
            @Parameter(description = "Stored file name", required = true)
            @PathVariable String filename
    ) {
        var resource = storageService.load(folder, filename);
        var contentType = MediaType.APPLICATION_OCTET_STREAM;
        var detectedContentType = URLConnection.guessContentTypeFromName(filename);

        if (detectedContentType != null) {
            contentType = MediaType.parseMediaType(detectedContentType);
        }

        return ResponseEntity.ok()
                .contentType(contentType)
                .body(resource);
    }
}
