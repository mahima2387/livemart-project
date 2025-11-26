package com.livemart.service;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class DemoPaymentService {
    
    public String createDemoOrder(Double amount) {
        // Generate a fake order ID
        return "DEMO_ORDER_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    public String processPayment(String orderId, String paymentMethod) {
        // Simulate payment processing
        // Generate a fake payment ID
        return "DEMO_PAY_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    public boolean verifyPayment(String orderId, String paymentId) {
        // In demo mode, all payments are successful
        return orderId != null && paymentId != null;
    }
}
