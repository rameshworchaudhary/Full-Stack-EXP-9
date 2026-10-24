package com.ci.dashboard.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;

@Component
@Order(1)
public class IngestionSecurityFilter extends OncePerRequestFilter {

    @Value("${ci.ingestion.token:ci-secret-token-change-me}")
    private String configuredToken;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String method = request.getMethod();
        String path = request.getRequestURI();

        // Only enforce token check on mutating endpoints like POST /api/test-runs
        if ("POST".equalsIgnoreCase(method) && path.startsWith("/api/test-runs")) {
            String token = request.getHeader("X-CI-Token");
            if (token == null || token.trim().isEmpty()) {
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7).trim();
                }
            }

            if (token == null || !token.equals(configuredToken)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.getWriter().write(String.format(
                        "{\"timestamp\":\"%s\",\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Invalid or missing CI ingestion token\"}",
                        Instant.now().toString()
                ));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
