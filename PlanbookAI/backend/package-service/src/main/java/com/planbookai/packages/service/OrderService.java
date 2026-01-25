package com.planbookai.packages.service;

import com.planbookai.packages.dto.OrderDTO;
import com.planbookai.packages.dto.SubscriptionDTO;
import com.planbookai.packages.entity.Order;
import com.planbookai.packages.entity.ServicePackage;
import com.planbookai.packages.entity.Subscription;
import com.planbookai.packages.repository.OrderRepository;
import com.planbookai.packages.repository.ServicePackageRepository;
import com.planbookai.packages.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private ServicePackageRepository packageRepository;
    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Transactional
    public OrderDTO createOrder(Long userId, Long packageId, String paymentMethod) {
        ServicePackage pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        Order order = new Order();
        order.setUserId(userId);
        order.setServicePackage(pkg);
        order.setAmount(pkg.getPrice());
        order.setPaymentMethod(paymentMethod);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setCheckCode("ORD-" + System.currentTimeMillis()); 

        order = orderRepository.save(order);
        return convertToDTO(order);
    }

    public List<OrderDTO> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status);
        order.setStatus(newStatus);
        orderRepository.save(order);

        // If PAID -> Activate Subscription
        if (newStatus == Order.OrderStatus.PAID) {
            activateSubscription(order.getUserId(), order.getServicePackage());
        }
    }

    private void activateSubscription(Long userId, ServicePackage pkg) {
        // Deactivate old subscription
        subscriptionRepository.findByUserIdAndStatus(userId, Subscription.SubscriptionStatus.ACTIVE)
            .ifPresent(sub -> {
                sub.setStatus(Subscription.SubscriptionStatus.EXPIRED);
                subscriptionRepository.save(sub);
            });

        Subscription sub = new Subscription();
        sub.setUserId(userId);
        sub.setServicePackage(pkg);
        sub.setStartDate(LocalDateTime.now());
        sub.setEndDate(LocalDateTime.now().plusDays(pkg.getDurationDays()));
        sub.setStatus(Subscription.SubscriptionStatus.ACTIVE);
        subscriptionRepository.save(sub);
    }

    public SubscriptionDTO getCurrentSubscription(Long userId) {
        return subscriptionRepository.findByUserIdAndStatus(userId, Subscription.SubscriptionStatus.ACTIVE)
                .map(sub -> {
                    SubscriptionDTO dto = new SubscriptionDTO();
                    dto.setId(sub.getId());
                    dto.setPackageName(sub.getServicePackage().getName());
                    dto.setStartDate(sub.getStartDate());
                    dto.setEndDate(sub.getEndDate());
                    dto.setStatus(sub.getStatus().name());
                    dto.setDaysLeft((int) ChronoUnit.DAYS.between(LocalDateTime.now(), sub.getEndDate()));
                    return dto;
                }).orElse(null);
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setPackageId(order.getServicePackage().getId());
        dto.setPackageName(order.getServicePackage().getName());
        dto.setAmount(order.getAmount());
        dto.setStatus(order.getStatus().name());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setCheckCode(order.getCheckCode());
        dto.setCreatedAt(order.getCreatedAt());
        return dto;
    }
}
