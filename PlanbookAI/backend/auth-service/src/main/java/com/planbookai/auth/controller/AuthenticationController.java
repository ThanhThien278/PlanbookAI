package com.planbookai.auth.controller;

import com.planbookai.auth.dto.AuthenticationRequest;
import com.planbookai.auth.dto.AuthenticationResponse;
import com.planbookai.auth.dto.RegisterRequest;
import com.planbookai.auth.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService service;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        try {
            return ResponseEntity.ok(service.register(request));
        } catch (Exception e) {
            e.printStackTrace(); // This will show in docker logs
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        try {
            return ResponseEntity.ok(service.authenticate(request));
        } catch (org.springframework.security.core.AuthenticationException e) {
            return ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid credentials"));
        } catch (Exception e) {
            System.err.println("CRITICAL LOGIN ERROR: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(java.util.Map.of("message", "Login failed: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthenticationResponse> refreshToken(
            @RequestBody com.planbookai.auth.dto.RefreshTokenRequest request
    ) {
        return ResponseEntity.ok(service.refreshToken(request));
    }

    @org.springframework.web.bind.annotation.GetMapping("/me")
    public ResponseEntity<AuthenticationResponse> me(
            java.security.Principal principal
    ) {
        return ResponseEntity.ok(service.me(principal.getName()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@org.springframework.web.bind.annotation.RequestHeader(org.springframework.http.HttpHeaders.AUTHORIZATION) String token) {
        service.logout(token);
        return ResponseEntity.ok().build();
    }
}
