package com.livemart.controller;

import com.livemart.model.User;
import com.livemart.service.DemoPaymentService;
import com.livemart.service.OrderService;
import com.livemart.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/customer/payment")
public class PaymentController {
    
    private final DemoPaymentService paymentService;
    private final OrderService orderService;
    private final UserService userService;
    
    public PaymentController(DemoPaymentService paymentService, OrderService orderService, UserService userService) {
        this.paymentService = paymentService;
        this.orderService = orderService;
        this.userService = userService;
    }
    
    @PostMapping("/create-order")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> createDemoOrder(@RequestBody Map<String, Double> request) {
        try {
            Double amount = request.get("amount");
            String orderId = paymentService.createDemoOrder(amount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", orderId);
            response.put("amount", amount);
            response.put("currency", "INR");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error creating demo order: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create payment order");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/verify")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> verifyPayment(
            @RequestBody Map<String, String> paymentData,
            Authentication auth) {
        try {
            String orderId = paymentData.get("orderId");
            String paymentId = paymentData.get("paymentId");
            String specialInstructions = paymentData.get("specialInstructions");
            String deliveryDateStr = paymentData.get("deliveryDate");
            
            boolean isValid = paymentService.verifyPayment(orderId, paymentId);
            
            Map<String, Object> response = new HashMap<>();
            
            if (isValid) {
                User user = userService.findByEmail(auth.getName());
                LocalDate deliveryDate = LocalDate.parse(deliveryDateStr);
                
                com.livemart.model.Order placedOrder = orderService.createOrder(
                    user, 
                    com.livemart.model.PaymentMethod.ONLINE, 
                    specialInstructions,
                    deliveryDate
                );
                
                response.put("success", true);
                response.put("orderNumber", placedOrder.getOrderNumber());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Payment verification failed");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            System.err.println("Error verifying payment: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
