package com.watchweb.app.domain.comment.controller;

import com.watchweb.app.domain.comment.dto.CreateWatchCommentRequest;
import com.watchweb.app.domain.comment.dto.WatchCommentResponse;
import com.watchweb.app.domain.comment.service.WatchCommentService;
import com.watchweb.app.exception.ApiErrorResponse;
import com.watchweb.app.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/watches/{watchId}/comments")
@Tag(name = "Watch comments", description = "Comment tree for watches in the catalog")
public class WatchCommentController {

    private final WatchCommentService watchCommentService;

    public WatchCommentController(WatchCommentService watchCommentService) {
        this.watchCommentService = watchCommentService;
    }

    @GetMapping
    @Operation(summary = "List watch comments", description = "Returns the comment tree for a watch.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Comment tree returned",
                    content = @Content(schema = @Schema(implementation = WatchCommentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Watch not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public List<WatchCommentResponse> list(
            @Parameter(description = "Watch identifier", required = true)
            @PathVariable UUID watchId
    ) {
        return watchCommentService.listTree(watchId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create watch comment", description = "Creates a root comment or a reply under a watch.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Comment created",
                    content = @Content(schema = @Schema(implementation = WatchCommentResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request body or comment depth exceeded",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Watch or parent comment not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public WatchCommentResponse create(
            @Parameter(description = "Watch identifier", required = true)
            @PathVariable UUID watchId,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateWatchCommentRequest request
    ) {
        return watchCommentService.create(watchId, principal.getId(), request);
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete watch comment", description = "Soft-deletes a watch comment without removing its replies.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Comment soft-deleted"),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Comment belongs to another user",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Comment not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public void delete(
            @Parameter(description = "Watch identifier", required = true)
            @PathVariable UUID watchId,
            @Parameter(description = "Comment identifier", required = true)
            @PathVariable UUID commentId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        watchCommentService.delete(watchId, commentId, principal.getId(), canDeleteAnyComment(principal));
    }

    private boolean canDeleteAnyComment(UserPrincipal principal) {
        return principal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_MODERATOR")
                        || authority.getAuthority().equals("ROLE_ADMIN"));
    }
}
