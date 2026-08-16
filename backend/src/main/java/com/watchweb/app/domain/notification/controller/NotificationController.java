package com.watchweb.app.domain.notification.controller;

import com.watchweb.app.domain.notification.dto.NotificationResponse;
import com.watchweb.app.domain.notification.dto.UnreadNotificationCountResponse;
import com.watchweb.app.domain.notification.service.NotificationService;
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
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Authenticated user's notifications")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "List notifications", description = "Returns the authenticated user's notifications.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Notifications returned",
                    content = @Content(schema = @Schema(implementation = NotificationResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public Page<NotificationResponse> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return notificationService.list(principal.getId(), pageable);
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Count unread notifications", description = "Returns the authenticated user's unread notification count.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Unread notifications counted",
                    content = @Content(schema = @Schema(implementation = UnreadNotificationCountResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public UnreadNotificationCountResponse countUnread(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return new UnreadNotificationCountResponse(notificationService.countUnread(principal.getId()));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Marks one notification owned by the authenticated user as read.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Notification marked as read",
                    content = @Content(schema = @Schema(implementation = NotificationResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Notification not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public NotificationResponse markAsRead(
            @Parameter(description = "Notification identifier", required = true)
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return notificationService.markAsRead(id, principal.getId());
    }
}
