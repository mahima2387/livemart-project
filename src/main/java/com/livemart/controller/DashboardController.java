package com.livemart.controller;

import com.livemart.model.User;
import com.livemart.service.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {
    
    private final UserService userService;
    private final ProductService productService;
    private final OrderService orderService;
    private final CartService cartService;
    
    public DashboardController(UserService userService, ProductService productService, OrderService orderService, CartService cartService) {
        this.userService = userService;
        this.productService = productService;
        this.orderService = orderService;
        this.cartService = cartService;
    }
    
    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
        // Get email from either regular login or OAuth2
        String email = getEmailFromAuthentication(authentication);
        User user = userService.findByEmail(email);
        
        model.addAttribute("user", user);
        
        switch (user.getRole()) {
            case CUSTOMER:
                return showCustomerDashboard(user, model);
            case RETAILER:
                return showRetailerDashboard(user, model);
            case WHOLESALER:
                return showWholesalerDashboard(user, model);
            default:
                return "redirect:/login";
        }
    }
    
    private String getEmailFromAuthentication(Authentication authentication) {
        // Check if it's OAuth2 login
        if (authentication.getPrincipal() instanceof OAuth2User) {
            OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
            return oauth2User.getAttribute("email");
        }
        // Regular login - email is the username
        return authentication.getName();
    }
    
    private String showCustomerDashboard(User user, Model model) {
        model.addAttribute("products", productService.getAvailableProducts());
        model.addAttribute("categories", productService.getAllCategories());
        model.addAttribute("cart", cartService.getOrCreateCart(user));
        model.addAttribute("recentOrders", orderService.getUserOrders(user));
        return "customer/dashboard";
    }
    
    private String showRetailerDashboard(User user, Model model) {
        model.addAttribute("myProducts", productService.getProductsBySeller(user));
        model.addAttribute("orders", orderService.getAllOrders());
        return "retailer/dashboard";
    }
    
    private String showWholesalerDashboard(User user, Model model) {
        model.addAttribute("myProducts", productService.getProductsBySeller(user));
        model.addAttribute("orders", orderService.getAllOrders());
        return "wholesaler/dashboard";
    }
}
