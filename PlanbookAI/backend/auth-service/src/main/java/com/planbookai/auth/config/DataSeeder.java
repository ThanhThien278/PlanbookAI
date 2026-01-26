package com.planbookai.auth.config;

import com.planbookai.auth.entity.Role;
import com.planbookai.auth.entity.User;
import com.planbookai.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            createUserIfNotFound("admin", "admin@planbook.ai", "admin123", Role.ADMIN);
            createUserIfNotFound("manager", "manager@planbook.ai", "manager123", Role.MANAGER);
            createUserIfNotFound("staff", "staff@planbook.ai", "staff123", Role.STAFF);
            createUserIfNotFound("giaovien", "giaovien@planbook.ai", "giaovien123", Role.TEACHER);
        } catch (Exception e) {
            e.printStackTrace();
            System.out.println("Data seeding failed: " + e.getMessage());
        }
    }

    private void createUserIfNotFound(String username, String email, String password, Role role) {
        if (userRepository.findByUsername(username).isEmpty()) {
            User user = User.builder()
                    .name(username.substring(0, 1).toUpperCase() + username.substring(1))
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(password))
                    .role(role)
                    .build();
            userRepository.save(user);
            System.out.println("Seeded user: " + username);
        }
    }
}
