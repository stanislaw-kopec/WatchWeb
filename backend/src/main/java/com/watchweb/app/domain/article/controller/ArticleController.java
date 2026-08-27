package com.watchweb.app.domain.article.controller;

import com.watchweb.app.domain.article.dto.ArticleImageResponse;
import com.watchweb.app.domain.article.dto.ArticleResponse;
import com.watchweb.app.domain.article.dto.CreateArticleRequest;
import com.watchweb.app.domain.article.dto.SaveArticleDraftRequest;
import com.watchweb.app.domain.article.dto.UpdateArticleRequest;
import com.watchweb.app.domain.article.entity.ArticleStatus;
import com.watchweb.app.domain.article.service.ArticleService;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
@Tag(name = "Articles", description = "Industry articles written by journalists")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    @Operation(summary = "List articles", description = "Returns a paginated list of published articles.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Articles returned",
                    content = @Content(schema = @Schema(implementation = ArticleResponse.class))
            )
    })
    public Page<ArticleResponse> list(
            @Parameter(description = "Optional text search in title or content", example = "microbrand")
            @RequestParam(required = false) String query,
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return articleService.search(query, pageable);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('JOURNALIST', 'ADMIN')")
    @Operation(summary = "List my articles", description = "Returns the authenticated author's drafts and published articles.")
    @SecurityRequirement(name = "bearerAuth")
    public Page<ArticleResponse> listMine(
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Optional article status filter", example = "DRAFT")
            @RequestParam(required = false) ArticleStatus status,
            @ParameterObject @PageableDefault(sort = "updatedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return articleService.listMine(principal.getId(), status, pageable);
    }

    @GetMapping("/me/{id}")
    @PreAuthorize("hasAnyRole('JOURNALIST', 'ADMIN')")
    @Operation(summary = "Get an article for management", description = "Returns an owned article, including a private draft. Admins may manage any article.")
    @SecurityRequirement(name = "bearerAuth")
    public ArticleResponse getMineById(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return articleService.getMineById(id, principal.getId(), canManageAnyArticle(principal));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get article by id", description = "Returns one published article by identifier.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Article found",
                    content = @Content(schema = @Schema(implementation = ArticleResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Article not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public ArticleResponse getById(
            @Parameter(description = "Article identifier", required = true)
            @PathVariable UUID id
    ) {
        return articleService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('JOURNALIST', 'ADMIN')")
    @Operation(summary = "Create article", description = "Creates and publishes an article without moderation.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Article created",
                    content = @Content(schema = @Schema(implementation = ArticleResponse.class))
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
            )
    })
    public ArticleResponse create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateArticleRequest request
    ) {
        return articleService.create(principal.getId(), request);
    }

    @PostMapping("/drafts")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('JOURNALIST', 'ADMIN')")
    @Operation(summary = "Create article draft", description = "Saves a private working copy without publishing it.")
    @SecurityRequirement(name = "bearerAuth")
    public ArticleResponse createDraft(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SaveArticleDraftRequest request
    ) {
        return articleService.createDraft(principal.getId(), request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('JOURNALIST', 'ADMIN')")
    @Operation(summary = "Update article", description = "Updates an article owned by the authenticated journalist or any article for admins.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Article updated",
                    content = @Content(schema = @Schema(implementation = ArticleResponse.class))
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
                    description = "Insufficient role or article belongs to another user",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Article not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public ArticleResponse update(
            @Parameter(description = "Article identifier", required = true)
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateArticleRequest request
    ) {
        return articleService.update(id, principal.getId(), canManageAnyArticle(principal), request);
    }

    @PutMapping("/{id}/draft")
    @PreAuthorize("hasAnyRole('JOURNALIST', 'ADMIN')")
    @Operation(summary = "Update article draft", description = "Saves changes to a private draft without publishing it.")
    @SecurityRequirement(name = "bearerAuth")
    public ArticleResponse updateDraft(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SaveArticleDraftRequest request
    ) {
        return articleService.updateDraft(id, principal.getId(), canManageAnyArticle(principal), request);
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('JOURNALIST', 'ADMIN')")
    @Operation(summary = "Publish article draft", description = "Publishes an owned draft immediately without moderation.")
    @SecurityRequirement(name = "bearerAuth")
    public ArticleResponse publish(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateArticleRequest request
    ) {
        return articleService.publish(id, principal.getId(), canManageAnyArticle(principal), request);
    }

    @PostMapping(path = "/content-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('JOURNALIST', 'ADMIN')")
    @Operation(summary = "Upload article content image", description = "Uploads a JPG, PNG or WEBP image for insertion into rich article content.")
    @SecurityRequirement(name = "bearerAuth")
    public ArticleImageResponse uploadContentImage(
            @Parameter(description = "Article content image file", required = true)
            @RequestPart("file") MultipartFile file
    ) {
        return articleService.uploadContentImage(file);
    }

    @PutMapping(path = "/{id}/header-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('JOURNALIST', 'ADMIN')")
    @Operation(summary = "Update article header image", description = "Uploads and assigns a JPG, PNG or WEBP header image to an article.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Header image updated",
                    content = @Content(schema = @Schema(implementation = ArticleResponse.class))
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
                    description = "Insufficient role or article belongs to another user",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Article not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public ArticleResponse updateHeaderImage(
            @Parameter(description = "Article identifier", required = true)
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal,
            @Parameter(description = "Article header image file", required = true)
            @RequestPart("file") MultipartFile file
    ) {
        return articleService.updateHeaderImage(id, principal.getId(), canManageAnyArticle(principal), file);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('JOURNALIST', 'ADMIN')")
    @Operation(summary = "Delete article", description = "Soft deletes an article owned by the authenticated journalist or any article for admins.")
    @SecurityRequirement(name = "bearerAuth")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Article deleted"),
            @ApiResponse(
                    responseCode = "401",
                    description = "Missing or invalid access token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Insufficient role or article belongs to another user",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Article not found",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public void delete(
            @Parameter(description = "Article identifier", required = true)
            @PathVariable UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        articleService.delete(id, principal.getId(), canManageAnyArticle(principal));
    }

    private boolean canManageAnyArticle(UserPrincipal principal) {
        return principal.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
    }
}
