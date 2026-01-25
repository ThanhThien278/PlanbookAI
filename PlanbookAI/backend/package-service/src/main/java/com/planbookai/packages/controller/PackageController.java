package com.planbookai.packages.controller;

import com.planbookai.packages.dto.OrderDTO;
import com.planbookai.packages.dto.PackageDTO;
import com.planbookai.packages.dto.SubscriptionDTO;
import com.planbookai.packages.service.OrderService;
import com.planbookai.packages.service.PackageManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map; // Import Map

@RestController
@RequestMapping("/api")
public class PackageController {

    @Autowired
    private PackageManagementService packageService;
    @Autowired
    private OrderService orderService;

    private Long getCurrentUserId(String userIdHeader) {
         if (userIdHeader == null) return 1L;
         return Long.parseLong(userIdHeader);
    }

    // --- MANAGER APIs ---
    @GetMapping("/manager/packages")
    public ResponseEntity<List<PackageDTO>> getAllPackagesForManager() {
        return ResponseEntity.ok(packageService.getAllPackages(true));
    }

    @PostMapping("/manager/packages")
    public ResponseEntity<PackageDTO> createPackage(@RequestBody PackageDTO dto) {
        return ResponseEntity.ok(packageService.createPackage(dto));
    }

    @GetMapping("/manager/orders")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/manager/orders/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        orderService.updateOrderStatus(id, payload.get("status"));
        return ResponseEntity.ok().build();
    }

    // --- TEACHER APIs ---
    @GetMapping("/teacher/packages")
    public ResponseEntity<List<PackageDTO>> getActivePackages() {
        return ResponseEntity.ok(packageService.getAllPackages(false));
    }

    @PostMapping("/teacher/orders")
    public ResponseEntity<OrderDTO> createOrder(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader,
            @RequestBody Map<String, Object> payload
    ) {
        Long userId = getCurrentUserId(userIdHeader);
        Long packageId = Long.parseLong(payload.get("package_id").toString());
        String method = payload.get("payment_method").toString();
        return ResponseEntity.ok(orderService.createOrder(userId, packageId, method));
    }

    @GetMapping("/teacher/orders")
    public ResponseEntity<List<OrderDTO>> getMyOrders(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        Long userId = getCurrentUserId(userIdHeader);
        return ResponseEntity.ok(orderService.getUserOrders(userId));
    }

    @GetMapping("/teacher/subscription")
    public ResponseEntity<SubscriptionDTO> getMySubscription(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader
    ) {
        Long userId = getCurrentUserId(userIdHeader);
        return ResponseEntity.ok(orderService.getCurrentSubscription(userId));
    }
}
