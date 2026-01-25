package com.planbookai.pkg.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Subscription {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId; // From X-User-Id
    
    @ManyToOne
    @JoinColumn(name = "package_id")
    private Package pkg;

    @CreationTimestamp
    private LocalDateTime startDate;
    
    private LocalDateTime endDate;
    
    private String status; // ACTIVE, EXPIRED
}
