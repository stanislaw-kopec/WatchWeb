package com.watchweb.app.domain.review.controller;

import com.watchweb.app.domain.review.dto.UserReviewResponse;
import com.watchweb.app.domain.review.service.ReviewService;
import com.watchweb.app.exception.ApiErrorResponse;
import com.watchweb.app.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me/reviews")
@Tag(name = "My reviews", description = "Authenticated user's watch reviews")
public class UserReviewController {

    private final ReviewService reviewService;

    public UserReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @Operation(summary = "List my reviews", description = "Returns reviews created by the authenticated user.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Reviews returned",
                    content = @Content(schema = @Schema(implementation = UserReviewResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public Page<UserReviewResponse> listMine(
            @AuthenticationPrincipal UserPrincipal principal,
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return reviewService.listByReviewer(principal.getId(), pageable);
    }
}
