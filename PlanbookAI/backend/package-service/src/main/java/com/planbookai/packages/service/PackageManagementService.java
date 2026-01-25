package com.planbookai.packages.service;

import com.planbookai.packages.dto.PackageDTO;
import com.planbookai.packages.entity.ServicePackage;
import com.planbookai.packages.repository.ServicePackageRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PackageManagementService {
    @Autowired
    private ServicePackageRepository packageRepository;

    public List<PackageDTO> getAllPackages(boolean includeHidden) {
        List<ServicePackage> packages;
        if (includeHidden) {
            packages = packageRepository.findAll();
        } else {
            packages = packageRepository.findByStatus(ServicePackage.PackageStatus.ACTIVE);
        }
        return packages.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public PackageDTO createPackage(PackageDTO dto) {
        ServicePackage entity = new ServicePackage();
        BeanUtils.copyProperties(dto, entity);
        entity.setStatus(ServicePackage.PackageStatus.valueOf(dto.getStatus()));
        return convertToDTO(packageRepository.save(entity));
    }
    
    // Helper
    private PackageDTO convertToDTO(ServicePackage entity) {
        PackageDTO dto = new PackageDTO();
        BeanUtils.copyProperties(entity, dto);
        dto.setStatus(entity.getStatus().name());
        return dto;
    }
}
