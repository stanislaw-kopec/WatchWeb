package com.watchweb.app.domain.hashtag.controller;

import com.watchweb.app.domain.hashtag.dto.HashtagResponse;
import com.watchweb.app.domain.hashtag.service.HashtagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hashtags")
@Tag(name = "Hashtags", description = "Normalized hashtags used by community posts")
public class HashtagController {

    private final HashtagService hashtagService;

    public HashtagController(HashtagService hashtagService) {
        this.hashtagService = hashtagService;
    }

    @GetMapping
    @Operation(summary = "List hashtags", description = "Returns hashtags sorted by name, optionally filtered by normalized name prefix.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Hashtags returned",
                    content = @Content(schema = @Schema(implementation = HashtagResponse.class))
            )
    })
    public Page<HashtagResponse> list(
            @Parameter(description = "Optional name prefix. Value is normalized before searching.", example = "sei")
            @RequestParam(required = false) String query,
            @ParameterObject @PageableDefault(sort = "name", direction = Sort.Direction.ASC) Pageable pageable
    ) {
        return hashtagService.list(query, pageable);
    }
}
