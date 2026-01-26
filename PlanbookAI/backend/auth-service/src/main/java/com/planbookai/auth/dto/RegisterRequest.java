package com.planbookai.auth.dto;

import com.planbookai.auth.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String username;
    private String name; // Can be null if fullName is used
    private String fullName;
    private String email;
    private String password;
    private Role role;
}
