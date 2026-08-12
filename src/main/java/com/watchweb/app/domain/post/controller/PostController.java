package com.watchweb.app.domain.post.controller;

import com.watchweb.app.domain.post.dto.CreatePostRequest;
import com.watchweb.app.domain.post.dto.PostResponse;
import com.watchweb.app.domain.post.dto.UpdatePostRequest;
import com.watchweb.app.domain.post.entity.PostStatus;
import com.watchweb.app.domain.post.service.PostService;
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
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/posts")
@Tag(name = "Posts", description = "Community user posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    @Operation(summary = "List approved posts", description = "Returns a paginated list of approved community posts.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Posts returned",
                    content = @Content(schema = @Schema(implementation = PostResponse.class))
            )
    })
    public Page<PostResponse> list(
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return postService.listApproved(pageable);
    }

    @GetMapping("/me")
    @Operation(
            summary = "List my posts",
            description = "Returns the authenticated user's posts, including pending and rejected posts."
    )
    @SecurityRequirement(name = "bearerAuth")
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
            )
    })
    public Page<PostResponse> listMine(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Optional status filter", example = "REJECTED")
            @RequestParam(required = false) PostStatus status,
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return postService.listMine(principal.getId(), status, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get approved post by id", description = "Returns one approved community post by identifier.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Post found",
                    content = @Content(schema = @Schema(implementation = PostResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Post not found or not approved",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public PostResponse getById(
            @Parameter(description = "Post identifier", required = true)
            @PathVariable UUID id
    ) {
        return postService.getApprovedById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create post", description = "Creates a community post as pending moderation.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Post created as pending",
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
            )
    })
    public PostResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreatePostRequest request
    ) {
        return postService.create(principal.getId(), request);
    }

    @PutMapping("/{id}")
    @Operation(
            summary = "Update own post",
            description = "Updates the authenticated user's post and sends it back to pending moderation."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Post updated as pending",
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
                    description = "Post belongs to another user",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Post not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public PostResponse update(
            @Parameter(description = "Post identifier", required = true)
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdatePostRequest request
    ) {
        return postService.update(id, principal.getId(), request);
    }

    @PutMapping(path = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(
            summary = "Update own post image",
            description = "Uploads and assigns a JPG, PNG or WEBP image to the authenticated user's post. The post returns to pending moderation."
    )
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Post image updated as pending",
                    content = @Content(schema = @Schema(implementation = PostResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid file",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Post belongs to another user",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Post not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public PostResponse updateImage(
            @Parameter(description = "Post identifier", required = true)
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Post image file", required = true)
            @RequestPart("file") MultipartFile file
    ) {
        return postService.updateImage(id, principal.getId(), file);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete own post", description = "Soft deletes the authenticated user's post.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Post deleted"),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Post belongs to another user",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Post not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public void delete(
            @Parameter(description = "Post identifier", required = true)
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        postService.delete(id, principal.getId());
    }
}
