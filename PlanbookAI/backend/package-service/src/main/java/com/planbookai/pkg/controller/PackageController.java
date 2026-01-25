package com.planbookai.pkg.controller;

import com.planbookai.pkg.entity.Package;
import com.planbookai.pkg.entity.Subscription;
import com.planbookai.pkg.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/packages")
@RequiredArgsConstructor
public class PackageController {
    private final PackageService service;

    @GetMapping
    public ResponseEntity<List<Package>> getAllPackages() {
        return ResponseEntity.ok(service.getAllPackages());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Package> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getPackageById(id));
    }

    @PostMapping("/{id}/subscribe")
    public ResponseEntity<?> subscribe(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId
    ) {
        service.subscribe(userId, id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<Subscription>> getSubscriptions(
            @RequestHeader("X-User-Id") Long userId
    ) {
        return ResponseEntity.ok(service.getSubscriptions(userId));
    }
}
