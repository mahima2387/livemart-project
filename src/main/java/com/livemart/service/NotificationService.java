package com.livemart.service;

import com.livemart.model.*;
import com.livemart.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }
    
    @Transactional
    public Notification createNotification(User user, String title, String message, NotificationType type, Long relatedOrderId) {
        Notification notification = new Notification(user, title, message, type, relatedOrderId);
        return notificationRepository.save(notification);
    }
    
    public List<Notification> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public List<Notification> getUnreadNotifications(User user) {
        return notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    }
    
    public Long getUnreadCount(User user) {
        return notificationRepository.countUnreadNotifications(user);
    }
    
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    
    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> notifications = notificationRepository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
        for (Notification notification : notifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
    
    // Notification creators for specific events
    @Transactional
    public void notifyOrderPlaced(Order order) {
        // Notify customer
        createNotification(
            order.getUser(),
            "Order Placed Successfully",
            "Your order #" + order.getOrderNumber() + " has been placed successfully. Total: ₹" + order.getTotalAmount(),
            NotificationType.ORDER_PLACED,
            order.getId()
        );
        
        // Notify retailers/wholesalers for products in the order
        for (OrderItem item : order.getOrderItems()) {
            User seller = item.getProduct().getSeller();
            createNotification(
                seller,
                "New Order Received",
                "You have received a new order for " + item.getProduct().getName() + " (Qty: " + item.getQuantity() + ")",
                NotificationType.NEW_ORDER_RECEIVED,
                order.getId()
            );
        }
    }
    
    @Transactional
    public void notifyOrderStatusUpdate(Order order, OrderStatus newStatus) {
        String title = "";
        String message = "";
        NotificationType type = NotificationType.GENERAL;
        
        switch (newStatus) {
            case CONFIRMED:
                title = "Order Confirmed";
                message = "Your order #" + order.getOrderNumber() + " has been confirmed and is being prepared.";
                type = NotificationType.ORDER_CONFIRMED;
                break;
            case PROCESSING:
                title = "Order Processing";
                message = "Your order #" + order.getOrderNumber() + " is now being processed.";
                type = NotificationType.ORDER_PROCESSING;
                break;
            case SHIPPED:
                title = "Order Shipped";
                message = "Great news! Your order #" + order.getOrderNumber() + " has been shipped and is on its way.";
                type = NotificationType.ORDER_SHIPPED;
                break;
            case OUT_FOR_DELIVERY:
                title = "Out for Delivery";
                message = "Your order #" + order.getOrderNumber() + " is out for delivery and will arrive soon.";
                type = NotificationType.ORDER_OUT_FOR_DELIVERY;
                break;
            case DELIVERED:
                title = "Order Delivered";
                message = "Your order #" + order.getOrderNumber() + " has been delivered. Thank you for shopping with us!";
                type = NotificationType.ORDER_DELIVERED;
                break;
            case CANCELLED:
                title = "Order Cancelled";
                message = "Your order #" + order.getOrderNumber() + " has been cancelled.";
                type = NotificationType.ORDER_CANCELLED;
                break;
        }
        
        if (!title.isEmpty()) {
            createNotification(order.getUser(), title, message, type, order.getId());
        }
    }
}
