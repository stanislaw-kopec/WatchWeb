package com.watchweb.app.domain.watch.controller;

import com.watchweb.app.domain.watch.dto.WatchResponse;
import com.watchweb.app.domain.watch.service.WatchCatalogService;
import com.watchweb.app.exception.ApiErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/watches")
@Tag(name = "Watch catalog", description = "Public watch catalog API")
public class WatchController {

    private final WatchCatalogService watchCatalogService;

    public WatchController(WatchCatalogService watchCatalogService) {
        this.watchCatalogService = watchCatalogService;
    }

    @GetMapping
    @Operation(summary = "List watches", description = "Returns a paginated list of approved watches from the catalog.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Watches returned",
                    content = @Content(schema = @Schema(implementation = WatchResponse.class))
            )
    })
    public Page<WatchResponse> list(
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return watchCatalogService.list(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get watch by id", description = "Returns details of a single approved watch from the catalog.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Watch found",
                    content = @Content(schema = @Schema(implementation = WatchResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Watch not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public WatchResponse getById(
            @Parameter(description = "Watch identifier", required = true)
            @PathVariable UUID id
    ) {
        return watchCatalogService.getById(id);
    }
}
