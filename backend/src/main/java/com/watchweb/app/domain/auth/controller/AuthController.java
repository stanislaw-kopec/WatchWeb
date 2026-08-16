package com.watchweb.app.domain.auth.controller;

import com.watchweb.app.domain.auth.dto.AuthResponse;
import com.watchweb.app.domain.auth.dto.LoginRequest;
import com.watchweb.app.domain.auth.dto.LogoutRequest;
import com.watchweb.app.domain.auth.dto.RefreshTokenRequest;
import com.watchweb.app.domain.auth.dto.RegisterRequest;
import com.watchweb.app.domain.auth.dto.RegisterResponse;
import com.watchweb.app.domain.auth.service.AuthService;
import com.watchweb.app.exception.ApiErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Authentication and registration API")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register user", description = "Creates a new user account with ROLE_USER.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "User registered",
                    content = @Content(schema = @Schema(implementation = RegisterResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Username or email already exists",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Login user", description = "Authenticates a user and returns JWT access and refresh tokens.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "User authenticated",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid email or password",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/refresh")
    @Operation(summary = "Refresh access token", description = "Consumes a refresh token and returns a new token pair.")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Token refreshed",
                    content = @Content(schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid refresh token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public AuthResponse refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Logout user", description = "Revokes the provided refresh token.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Refresh token revoked"),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request body",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Invalid refresh token",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    public void logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
    }
}
