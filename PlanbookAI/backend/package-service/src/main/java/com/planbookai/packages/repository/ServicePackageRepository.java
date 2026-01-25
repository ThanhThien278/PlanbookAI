package com.planbookai.packages.repository;

import com.planbookai.packages.entity.ServicePackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServicePackageRepository extends JpaRepository<ServicePackage, Long> {
    List<ServicePackage> findByStatus(ServicePackage.PackageStatus status);
    Optional<ServicePackage> findByCode(String code);
}
