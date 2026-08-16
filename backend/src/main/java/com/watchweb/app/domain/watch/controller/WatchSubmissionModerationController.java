package com.watchweb.app.domain.watch.controller;

import com.watchweb.app.domain.watch.dto.ModerationWatchSubmissionResponse;
import com.watchweb.app.domain.watch.dto.RejectWatchSubmissionRequest;
import com.watchweb.app.domain.watch.dto.WatchResponse;
import com.watchweb.app.domain.watch.dto.WatchSubmissionResponse;
import com.watchweb.app.domain.watch.entity.WatchSubmissionStatus;
import com.watchweb.app.domain.watch.service.WatchSubmissionModerationService;
import com.watchweb.app.exception.ApiErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/moderation/watch-submissions")
@Tag(name = "Watch submission moderation", description = "Moderator review of watch catalog submissions")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
public class WatchSubmissionModerationController {

    private final WatchSubmissionModerationService moderationService;

    public WatchSubmissionModerationController(WatchSubmissionModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @GetMapping
    @Operation(
            summary = "List watch submissions for moderation",
            description = "Returns a paginated moderation queue. The status filter is optional."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Watch submissions returned",
                    content = @Content(schema = @Schema(implementation = ModerationWatchSubmissionResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Insufficient role",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public Page<ModerationWatchSubmissionResponse> list(
            @Parameter(description = "Optional moderation status filter", example = "PENDING")
            @RequestParam(required = false) WatchSubmissionStatus status,
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return moderationService.list(status, pageable);
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve watch submission", description = "Approves a pending submission and creates a watch catalog entry.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Submission approved and watch created",
                    content = @Content(schema = @Schema(implementation = WatchResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Insufficient role",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Submission not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Submission is not pending or watch already exists",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public WatchResponse approve(
            @Parameter(description = "Watch submission identifier", required = true)
            @PathVariable UUID id
    ) {
        return moderationService.approve(id);
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject watch submission", description = "Rejects a pending watch submission with a reason.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Submission rejected",
                    content = @Content(schema = @Schema(implementation = WatchSubmissionResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Insufficient role",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Submission not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Submission is not pending",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public WatchSubmissionResponse reject(
            @Parameter(description = "Watch submission identifier", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody RejectWatchSubmissionRequest request
    ) {
        return moderationService.reject(id, request.reason());
    }
}
