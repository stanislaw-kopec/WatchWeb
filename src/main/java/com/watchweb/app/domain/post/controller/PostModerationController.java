package com.watchweb.app.domain.post.controller;

import com.watchweb.app.domain.post.dto.PostResponse;
import com.watchweb.app.domain.post.dto.RejectPostRequest;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.service.PostModerationService;
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
@RequestMapping("/api/moderation/posts")
@Tag(name = "Post moderation", description = "Moderator review of community posts")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasAnyRole('MODERATOR', 'ADMIN')")
public class PostModerationController {

    private final PostModerationService postModerationService;

    public PostModerationController(PostModerationService postModerationService) {
        this.postModerationService = postModerationService;
    }

    @GetMapping
    @Operation(
            summary = "List posts for moderation",
            description = "Returns a paginated moderation queue. The status filter is optional."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Posts returned",
                    content = @Content(schema = @Schema(implementation = PostResponse.class))
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
    public Page<PostResponse> list(
            @Parameter(description = "Optional moderation status filter", example = "PENDING")
            @RequestParam(required = false) PostStatus status,
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return postModerationService.list(status, pageable);
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "Approve post", description = "Approves a pending post and makes it visible publicly.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Post approved",
                    content = @Content(schema = @Schema(implementation = PostResponse.class))
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
                    description = "Post not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Post is not pending",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public PostResponse approve(
            @Parameter(description = "Post identifier", required = true)
            @PathVariable UUID id
    ) {
        return postModerationService.approve(id);
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject post", description = "Rejects a pending post with a reason.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Post rejected",
                    content = @Content(schema = @Schema(implementation = PostResponse.class))
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
                    description = "Post not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Post is not pending",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public PostResponse reject(
            @Parameter(description = "Post identifier", required = true)
            @PathVariable UUID id,
            @Valid @RequestBody RejectPostRequest request
    ) {
        return postModerationService.reject(id, request.reason());
    }
}
