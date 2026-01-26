package com.planbookai.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.planbookai.auth.entity.Role;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationRequest {
    private String email;
    private String password;
}

// Separate file logic simulated by just dumping multiple files in subsequent calls, 
// but for brevity I'll do separate files if needed. 
// Actually, I will create multiple files here.
