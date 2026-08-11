package com.watchweb.app.domain.watch.controller;

import com.watchweb.app.domain.watch.dto.CreateWatchSubmissionRequest;
import com.watchweb.app.domain.watch.dto.WatchSubmissionResponse;
import com.watchweb.app.domain.watch.service.WatchSubmissionService;
import com.watchweb.app.exception.ApiErrorResponse;
import com.watchweb.app.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/watch-submissions")
@Tag(name = "Watch submissions", description = "Watch catalog submissions")
public class WatchSubmissionController {

    private final WatchSubmissionService watchSubmissionService;

    public WatchSubmissionController(WatchSubmissionService watchSubmissionService) {
        this.watchSubmissionService = watchSubmissionService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Submit watch", description = "Creates a pending watch catalog submission for moderator review.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Watch submission created",
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
                    responseCode = "409",
                    description = "Watch already exists or submission is pending",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public WatchSubmissionResponse submit(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody CreateWatchSubmissionRequest request
    ) {
        return watchSubmissionService.submit(currentUser.getId(), request);
    }
}
