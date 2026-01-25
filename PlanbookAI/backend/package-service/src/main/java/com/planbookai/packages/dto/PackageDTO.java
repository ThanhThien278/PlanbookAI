package com.planbookai.packages.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class PackageDTO {
    private Long id;
    private String name;
    private String code;
    private BigDecimal price;
    private Integer durationDays;
    private String features; // JSON string
    private String status;
}
