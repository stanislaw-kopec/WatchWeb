package com.watchweb.app.domain.article.controller;

import com.watchweb.app.domain.article.dto.ArticleResponse;
import com.watchweb.app.domain.article.dto.CreateArticleRequest;
import com.watchweb.app.domain.article.dto.UpdateArticleRequest;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

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
            @ParameterObject @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return articleService.list(pageable);
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
