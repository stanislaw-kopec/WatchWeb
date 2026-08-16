package com.watchweb.app.security;

import com.watchweb.app.domain.user.repository.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        var authorization = request.getHeader(AUTHORIZATION_HEADER);

        if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        var token = authorization.substring(BEARER_PREFIX.length());

        try {
            var userId = jwtService.extractUserId(token);
            userRepository.findByIdAndAnonymizedAtIsNull(userId)
                    .map(UserPrincipal::fromEntity)
                    .ifPresent(principal -> {
                        var authentication = new UsernamePasswordAuthenticationToken(
                                principal,
                                null,
                                principal.getAuthorities()
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    });
        } catch (IllegalArgumentException | JwtException ignored) {
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
