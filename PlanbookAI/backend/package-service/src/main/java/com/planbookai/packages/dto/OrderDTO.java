package com.planbookai.packages.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderDTO {
    private Long id;
    private Long userId;
    private Long packageId;
    private String packageName;
    private BigDecimal amount;
    private String status;
    private String paymentMethod;
    private String checkCode;
    private LocalDateTime createdAt;
}
