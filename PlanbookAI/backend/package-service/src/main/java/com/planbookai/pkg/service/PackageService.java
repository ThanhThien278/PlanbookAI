package com.planbookai.pkg.service;

import com.planbookai.pkg.entity.Package;
import com.planbookai.pkg.entity.Subscription;
import com.planbookai.pkg.repository.PackageRepository;
import com.planbookai.pkg.repository.SubscriptionRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PackageService {
    private final PackageRepository packageRepository;
    private final SubscriptionRepository subscriptionRepository;

    @PostConstruct
    public void init() {
        if (packageRepository.count() == 0) {
            packageRepository.saveAll(List.of(
                    Package.builder()
                            .name("Free")
                            .description("Basic features")
                            .price(BigDecimal.ZERO)
                            .duration("FOREVER")
                            .features(List.of("5 Lessons/Month", "Basic AI"))
                            .build(),
                    Package.builder()
                            .name("Pro")
                            .description("Advanced features for professionals")
                            .price(new BigDecimal("9.99"))
                            .duration("MONTHLY")
                            .features(List.of("Unlimited Lessons", "Advanced AI", "Priority Support"))
                            .build()
            ));
        }
    }

    public List<Package> getAllPackages() {
        return packageRepository.findAll();
    }

    public Package getPackageById(Long id) {
        return packageRepository.findById(id).orElseThrow(() -> new RuntimeException("Package not found"));
    }

    public void subscribe(Long userId, Long packageId) {
        Package pkg = getPackageById(packageId);
        Subscription subscription = Subscription.builder()
                .userId(userId)
                .pkg(pkg)
                .status("ACTIVE")
                .endDate(LocalDateTime.now().plusMonths(1)) // Simple logic
                .build();
        subscriptionRepository.save(subscription);
    }

    public List<Subscription> getSubscriptions(Long userId) {
        return subscriptionRepository.findByUserId(userId);
    }
}
