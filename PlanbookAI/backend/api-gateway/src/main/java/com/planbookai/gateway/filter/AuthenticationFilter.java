package com.planbookai.gateway.filter;

import com.planbookai.gateway.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtUtil jwtUtil;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return ((exchange, chain) -> {
            if (validator(exchange)) {
                if (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                    throw new RuntimeException("Missing Authorization header");
                }

                String authHeader = exchange.getRequest().getHeaders().get(HttpHeaders.AUTHORIZATION).get(0);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    authHeader = authHeader.substring(7);
                }
                try {
                    jwtUtil.validateToken(authHeader);
                    
                    // Add user info header to request
                    String username = jwtUtil.extractUsername(authHeader);
                    Integer userId = jwtUtil.extractClaim(authHeader, claims -> claims.get("userId", Integer.class));
                    
                    ServerHttpRequest request = exchange.getRequest().mutate()
                            .header("X-Auth-User", username)
                            .header("X-User-Id", String.valueOf(userId))
                            .build();
                    return chain.filter(exchange.mutate().request(request).build());
                    
                } catch (Exception e) {
                    throw new RuntimeException("Unauthorized access to application");
                }
            }
            return chain.filter(exchange);
        });
    }
    
    // Quick check to exclude public endpoints if strictly needed here, 
    // but SecurityConfig is preferred for broader control.
    // However, for detailed JWT parsing within Cloud Gateway, a filter is often cleaner.
    private boolean validator(ServerWebExchange exchange) {
        return !exchange.getRequest().getURI().getPath().contains("/api/auth");
    }

    public static class Config {

    }
}
