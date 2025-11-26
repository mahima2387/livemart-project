package com.livemart.service;

import com.livemart.model.*;
import com.livemart.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductService productService;
    private final NotificationService notificationService;
    
    public OrderService(OrderRepository orderRepository, CartService cartService, 
                       ProductService productService, NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.productService = productService;
        this.notificationService = notificationService;
    }
    
    public Order createOrder(User user, PaymentMethod paymentMethod, String specialInstructions, LocalDate deliveryDate) {
        Cart cart = cartService.getOrCreateCart(user);
        
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        Order order = new Order();
        order.setOrderNumber("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(paymentMethod);
        order.setPaymentCompleted(paymentMethod == PaymentMethod.ONLINE || paymentMethod == PaymentMethod.UPI || paymentMethod == PaymentMethod.CREDIT_CARD || paymentMethod == PaymentMethod.DEBIT_CARD || paymentMethod == PaymentMethod.NET_BANKING);
        order.setSpecialInstructions(specialInstructions);
        order.setDeliveryDate(deliveryDate);
        
        Double totalAmount = 0.0;
        
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getProduct().getPrice());
            
            order.getOrderItems().add(orderItem);
            totalAmount += cartItem.getProduct().getPrice() * cartItem.getQuantity();
            
            // Reduce stock
            productService.reduceStock(cartItem.getProduct().getId(), cartItem.getQuantity());
        }
        
        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);
        
        // Notify all sellers after order is saved
        for (CartItem cartItem : cart.getItems()) {
            User seller = cartItem.getProduct().getSeller();
            String title = "New Order Received";
            String message = String.format(
                "Order #%s: Customer %s ordered %s (Qty: %d). " +
                "Requested delivery: %s. Amount: ₹%.2f",
                savedOrder.getOrderNumber(),
                user.getFullName(),
                cartItem.getProduct().getName(),
                cartItem.getQuantity(),
                deliveryDate.toString(),
                cartItem.getProduct().getPrice() * cartItem.getQuantity()
            );
            notificationService.createNotification(seller, title, message, NotificationType.ORDER_RECEIVED, savedOrder.getId());
        }
        
        // Clear cart after order
        cartService.clearCart(user);
        
        return savedOrder;
    }
    
    // B2B Order creation (for marketplace)
    public Order createB2BOrder(User buyer, Product product, Integer quantity, String specialInstructions) {
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock available");
        }
        
        Order order = new Order();
        order.setOrderNumber("B2B-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setUser(buyer);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY);
        order.setPaymentCompleted(false);
        order.setSpecialInstructions(specialInstructions);
        order.setDeliveryDate(LocalDate.now().plusDays(7)); // Default 7 days for B2B
        
        OrderItem orderItem = new OrderItem();
        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setQuantity(quantity);
        orderItem.setPrice(product.getPrice());
        
        order.getOrderItems().add(orderItem);
        order.setTotalAmount(product.getPrice() * quantity);
        
        // Reduce stock
        productService.reduceStock(product.getId(), quantity);
        
        Order savedOrder = orderRepository.save(order);
        
        // Notify wholesaler
        String title = "New B2B Order";
        String message = String.format(
            "B2B Order #%s: %s ordered %s (Qty: %d). Total: ₹%.2f. Delivery: %s",
            savedOrder.getOrderNumber(),
            buyer.getFullName(),
            product.getName(),
            quantity,
            savedOrder.getTotalAmount(),
            savedOrder.getDeliveryDate().toString()
        );
        notificationService.createNotification(product.getSeller(), title, message, NotificationType.ORDER_RECEIVED, savedOrder.getId());
        
        return savedOrder;
    }
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public List<Order> getUserOrders(User user) {
        return orderRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = getOrderById(orderId);
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        
        // Notify customer about status change
        String title = "Order Status Update";
        String message = String.format(
            "Your order #%s status has been updated from %s to %s.",
            order.getOrderNumber(),
            oldStatus,
            status
        );
        
        // Add delivery date reminder if status is SHIPPED
        if (status == OrderStatus.SHIPPED && order.getDeliveryDate() != null) {
            message += String.format(" Expected delivery: %s", order.getDeliveryDate().toString());
        }
        
        notificationService.createNotification(order.getUser(), title, message, NotificationType.ORDER_UPDATE, order.getId());
        
        return updatedOrder;
    }
}
