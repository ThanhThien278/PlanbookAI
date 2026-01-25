package com.planbookai.packages.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServicePackage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Basic, Pro

    @Column(unique = true, nullable = false)
    private String code; // PKG_BASIC_1M

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "duration_days")
    private Integer durationDays; // 30, 365

    @Column(columnDefinition = "JSON")
    private String features; // JSON string of features

    @Enumerated(EnumType.STRING)
    private PackageStatus status; // ACTIVE, HIDDEN

    public enum PackageStatus {
        ACTIVE, HIDDEN
    }
}
