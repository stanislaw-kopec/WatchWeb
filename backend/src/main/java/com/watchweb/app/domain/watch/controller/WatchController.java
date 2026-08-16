package com.watchweb.app.domain.watch.controller;

import com.watchweb.app.domain.watch.dto.WatchResponse;
import com.watchweb.app.domain.watch.entity.MovementType;
import com.watchweb.app.domain.watch.service.WatchCatalogService;
import com.watchweb.app.exception.ApiErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PositiveOrZero;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/watches")
@Tag(name = "Watch catalog", description = "Public watch catalog API")
@Validated
public class WatchController {

    private final WatchCatalogService watchCatalogService;

    public WatchController(WatchCatalogService watchCatalogService) {
        this.watchCatalogService = watchCatalogService;
    }

    @GetMapping
    @Operation(
            summary = "List watches",
            description = "Returns a paginated list of approved watches from the catalog. Optional filters can narrow the result."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Watches returned",
                    content = @Content(schema = @Schema(implementation = WatchResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid filter value",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public Page<WatchResponse> list(
            @Parameter(description = "Brand filter, case-insensitive", example = "Seiko")
            @RequestParam(required = false) String brand,

            @Parameter(description = "Movement type filter", example = "AUTOMATIC")
            @RequestParam(required = false) MovementType movementType,

            @Parameter(description = "Minimum case diameter in millimeters", example = "38.00")
            @DecimalMin(value = "0.0", inclusive = true)
            @RequestParam(required = false) BigDecimal minCaseDiameterMm,

            @Parameter(description = "Maximum case diameter in millimeters", example = "42.00")
            @DecimalMin(value = "0.0", inclusive = true)
            @RequestParam(required = false) BigDecimal maxCaseDiameterMm,

            @Parameter(description = "Minimum water resistance in meters", example = "100")
            @PositiveOrZero
            @RequestParam(required = false) Integer minWaterResistanceM,

            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return watchCatalogService.list(
                brand,
                movementType,
                minCaseDiameterMm,
                maxCaseDiameterMm,
                minWaterResistanceM,
                pageable
        );
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
