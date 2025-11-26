package com.livemart.controller;

import com.livemart.model.*;
import com.livemart.service.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/customer")
public class CustomerController {
    
    private final UserService userService;
    private final ProductService productService;
    private final CartService cartService;
    private final OrderService orderService;
    private final FeedbackService feedbackService;
    private final NotificationService notificationService;
    
    public CustomerController(UserService userService, ProductService productService,
                            CartService cartService, OrderService orderService,
                            FeedbackService feedbackService, NotificationService notificationService) {
        this.userService = userService;
        this.productService = productService;
        this.cartService = cartService;
        this.orderService = orderService;
        this.feedbackService = feedbackService;
        this.notificationService = notificationService;
    }
    
    @GetMapping("/products")
    public String viewProducts(@RequestParam(required = false) String search,
                              @RequestParam(required = false) String category,
                              @RequestParam(required = false) String minPrice,
                              @RequestParam(required = false) String maxPrice,
                              @RequestParam(required = false) Boolean inStock,
                              Authentication auth, Model model) {
        User user = userService.findByEmail(auth.getName());
        List<Product> products;
        
        // Convert string prices to Double
        Double minPriceValue = null;
        Double maxPriceValue = null;
        
        if (minPrice != null && !minPrice.isEmpty()) {
            try {
                minPriceValue = Double.parseDouble(minPrice);
            } catch (NumberFormatException e) {
                // Ignore invalid input
            }
        }
        
        if (maxPrice != null && !maxPrice.isEmpty()) {
            try {
                maxPriceValue = Double.parseDouble(maxPrice);
            } catch (NumberFormatException e) {
                // Ignore invalid input
            }
        }
        
        // Clean up category - treat empty string as null
        if (category != null && category.isEmpty()) {
            category = null;
        }
        
        if (search != null && !search.isEmpty()) {
            products = productService.searchProducts(search);
        } else if (category != null || minPriceValue != null || maxPriceValue != null || inStock != null) {
            products = productService.filterProducts(category, minPriceValue, maxPriceValue, inStock);
        } else {
            products = productService.getAvailableProducts();
        }
        
        model.addAttribute("products", products);
        model.addAttribute("categories", productService.getAllCategories());
        model.addAttribute("selectedCategory", category);
        model.addAttribute("minPrice", minPrice);
        model.addAttribute("maxPrice", maxPrice);
        model.addAttribute("inStock", inStock);
        model.addAttribute("user", user);
        model.addAttribute("unreadCount", notificationService.getUnreadCount(user));
        return "customer/products";
    }
    
    @GetMapping("/product/{id}")
    public String viewProductDetails(@PathVariable Long id, Authentication auth, Model model) {
        User user = userService.findByEmail(auth.getName());
        Product product = productService.getProductById(id);
        List<Feedback> feedbacks = feedbackService.getProductFeedbacks(id);
        
        double averageRating = feedbackService.getAverageRating(id);
        long totalReviews = feedbackService.getTotalReviews(id);
        
        model.addAttribute("product", product);
        model.addAttribute("feedbacks", feedbacks);
        model.addAttribute("averageRating", averageRating);
        model.addAttribute("totalReviews", totalReviews);
        model.addAttribute("user", user);
        model.addAttribute("unreadCount", notificationService.getUnreadCount(user));
        return "customer/product-details";
    }
    
    @PostMapping("/feedback/submit")
    public String submitFeedback(@RequestParam Long productId,
                                 @RequestParam Integer rating,
                                 @RequestParam String comment,
                                 Authentication auth,
                                 RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            feedbackService.createFeedback(user, productId, rating, comment);
            redirectAttributes.addFlashAttribute("success", "Review submitted successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to submit review: " + e.getMessage());
        }
        return "redirect:/customer/product/" + productId;
    }
    
    @GetMapping("/cart")
    public String viewCart(Authentication auth, Model model) {
        User user = userService.findByEmail(auth.getName());
        Cart cart = cartService.getOrCreateCart(user);
        
        model.addAttribute("cart", cart);
        model.addAttribute("user", user);
        model.addAttribute("unreadCount", notificationService.getUnreadCount(user));
        return "customer/cart";
    }
    
    @PostMapping("/cart/add")
    public String addToCart(@RequestParam Long productId,
                           @RequestParam Integer quantity,
                           Authentication auth,
                           RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            cartService.addToCart(user, productId, quantity);
            redirectAttributes.addFlashAttribute("success", "Product added to cart!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/products";
    }
    
    @PostMapping("/cart/update")
    public String updateCart(@RequestParam Long itemId,
                            @RequestParam Integer quantity,
                            Authentication auth,
                            RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            cartService.updateCartItemQuantity(user, itemId, quantity);
            redirectAttributes.addFlashAttribute("success", "Cart updated!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/cart";
    }
    
    @PostMapping("/cart/remove/{itemId}")
    public String removeFromCart(@PathVariable Long itemId, Authentication auth, RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            cartService.removeFromCart(user, itemId);
            redirectAttributes.addFlashAttribute("success", "Item removed from cart!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/customer/cart";
    }
    
    @GetMapping("/checkout")
    public String checkout(Authentication auth, Model model) {
        User user = userService.findByEmail(auth.getName());
        Cart cart = cartService.getOrCreateCart(user);
        
        if (cart.getItems().isEmpty()) {
            return "redirect:/customer/cart";
        }
        
        model.addAttribute("cart", cart);
        model.addAttribute("user", user);
        model.addAttribute("unreadCount", notificationService.getUnreadCount(user));
        return "customer/checkout";
    }
    
    @PostMapping("/order/place")
    public String placeOrder(@RequestParam String paymentMethod,
                            @RequestParam(required = false) String specialInstructions,
                            @RequestParam String deliveryDate,
                            Authentication auth,
                            RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            PaymentMethod method = PaymentMethod.valueOf(paymentMethod);
            LocalDate preferredDeliveryDate = LocalDate.parse(deliveryDate);
            Order order = orderService.createOrder(user, method, specialInstructions, preferredDeliveryDate);
            redirectAttributes.addFlashAttribute("success", "Order placed successfully! Order #" + order.getOrderNumber() + ". Expected delivery: " + preferredDeliveryDate);
            return "redirect:/customer/orders";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/customer/checkout";
        }
    }
    
    @GetMapping("/orders")
    public String viewOrders(Authentication auth, Model model) {
        User user = userService.findByEmail(auth.getName());
        List<Order> orders = orderService.getUserOrders(user);
        
        model.addAttribute("orders", orders);
        model.addAttribute("user", user);
        model.addAttribute("unreadCount", notificationService.getUnreadCount(user));
        return "customer/orders";
    }
    
    @GetMapping("/order/{id}")
    public String viewOrderDetails(@PathVariable Long id, Authentication auth, Model model, RedirectAttributes redirectAttributes) {
        User user = userService.findByEmail(auth.getName());
        try {
            Order order = orderService.getOrderById(id);
            
            if (!order.getUser().getId().equals(user.getId())) {
                redirectAttributes.addFlashAttribute("error", "Unauthorized access!");
                return "redirect:/customer/orders";
            }
            
            model.addAttribute("order", order);
            model.addAttribute("user", user);
            model.addAttribute("unreadCount", notificationService.getUnreadCount(user));
            return "customer/order-details";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", "Order not found!");
            return "redirect:/customer/orders";
        }
    }
}
