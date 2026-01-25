package com.planbookai.packages.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SubscriptionDTO {
    private Long id;
    private String packageName;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String status;
    private Integer daysLeft;
}
