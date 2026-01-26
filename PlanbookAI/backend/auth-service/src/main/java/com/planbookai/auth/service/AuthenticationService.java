package com.planbookai.auth.service;

import com.planbookai.auth.dto.AuthenticationRequest;
import com.planbookai.auth.dto.AuthenticationResponse;
import com.planbookai.auth.dto.RefreshTokenRequest;
import com.planbookai.auth.dto.RegisterRequest;
import com.planbookai.auth.entity.Role;
import com.planbookai.auth.entity.User;
import com.planbookai.auth.entity.TokenBlacklist;
import com.planbookai.auth.repository.TokenBlacklistRepository;
import com.planbookai.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {
    private final UserRepository repository;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthenticationResponse register(RegisterRequest request) {
        log.info("REGISTER REQUEST: username={}, email={}", request.getUsername(), request.getEmail());
        
        if (request.getUsername() != null && repository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        
        if (repository.findByEmail(request.getEmail()).isPresent()) {
           throw new RuntimeException("Email already exists");
        }

        var user = User.builder()
                .name(request.getFullName() != null ? request.getFullName() : request.getName())
                .username(request.getUsername() != null ? request.getUsername() : request.getEmail().split("@")[0])
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : Role.TEACHER)
                .build();
        
        log.info("SAVING USER: {}", user);
        repository.save(user);
        log.info("USER SAVED: id={}", user.getId());
        
        var extraClaims = new java.util.HashMap<String, Object>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole());
        var jwtToken = jwtService.generateToken(extraClaims, user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        log.info("LOGIN REQUEST: email/username={}", request.getEmail());
        
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            log.error("Authentication failed for user: {}", request.getEmail(), e);
            throw e;
        }
        
        var input = request.getEmail(); 
        var user = repository.findByUsernameOrEmail(input, input)
                .orElseThrow();
                
        var extraClaims = new java.util.HashMap<String, Object>();
        extraClaims.put("userId", user.getId());
        extraClaims.put("role", user.getRole());
        var jwtToken = jwtService.generateToken(extraClaims, user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .refreshToken(refreshToken)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        String userEmail = jwtService.extractUsername(request.getToken());
        if (userEmail != null) {
            // Note: extractUsername from token might return username or email depending on how it was created (here uses user.getUsername() which returns email in vanilla UserDetails implementation unless overridden)
            // But let's check my User entity. It implements UserDetails.
            // If User.getUsername() returns field username, then extractUsername returns username.
            // UserDetails.getUsername() is usually the unique identifier.
            // Let's assume unique identifier.
            
            var user = repository.findByUsernameOrEmail(userEmail, userEmail)
                    .orElseThrow();
            if (jwtService.isTokenValid(request.getToken(), user)) {
                var extraClaims = new java.util.HashMap<String, Object>();
                extraClaims.put("userId", user.getId());
                extraClaims.put("role", user.getRole());
                var accessToken = jwtService.generateToken(extraClaims, user);
                return AuthenticationResponse.builder()
                        .token(accessToken)
                        .refreshToken(request.getToken())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .build();
            }
        }
        throw new RuntimeException("Invalid refresh token");
    }

    public AuthenticationResponse me(String email) {
        var user = repository.findByEmail(email) // Principal name might be username now?
             .or(() -> repository.findByUsername(email)) // Fallback if principal is username
             .orElseThrow(() -> new RuntimeException("User not found"));
             
        return AuthenticationResponse.builder()
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public void logout(String token) {
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        java.util.Date expiration = jwtService.extractClaim(token, io.jsonwebtoken.Claims::getExpiration);
        TokenBlacklist blacklistToken = TokenBlacklist.builder()
                .token(token)
                .expirationDate(expiration)
                .build();
        tokenBlacklistRepository.save(blacklistToken);
    }
}
