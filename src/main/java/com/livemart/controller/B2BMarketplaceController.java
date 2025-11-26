package com.livemart.controller;

import com.livemart.model.*;
import com.livemart.service.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/retailer/marketplace")
public class B2BMarketplaceController {
    
    private final UserService userService;
    private final ProductService productService;
    private final OrderService orderService;
    
    public B2BMarketplaceController(UserService userService, ProductService productService, OrderService orderService) {
        this.userService = userService;
        this.productService = productService;
        this.orderService = orderService;
    }
    
    // Helper method to check if user is a retailer
    private boolean isRetailer(User user) {
        return user.getRole() == UserRole.RETAILER;
    }
    
    @GetMapping
    public String viewMarketplace(@RequestParam(required = false) String category, 
                                 @RequestParam(required = false) String search,
                                 Authentication auth, Model model) {
        User retailer = userService.findByEmail(auth.getName());
        
        // Security check - only retailers can access
        if (!isRetailer(retailer)) {
            return "redirect:/dashboard";
        }
        
        // Get all wholesaler products (exclude retailer's own products)
        List<Product> wholesalerProducts = productService.getAllProducts().stream()
            .filter(p -> p.getSeller().getRole() == UserRole.WHOLESALER)
            .filter(p -> !p.getSeller().getId().equals(retailer.getId()))
            .filter(p -> p.getAvailable() && p.getStockQuantity() > 0)
            .collect(Collectors.toList());
        
        if (search != null && !search.isEmpty()) {
            wholesalerProducts = wholesalerProducts.stream()
                .filter(p -> p.getName().toLowerCase().contains(search.toLowerCase()) ||
                           p.getDescription().toLowerCase().contains(search.toLowerCase()))
                .collect(Collectors.toList());
        } else if (category != null && !category.isEmpty()) {
            wholesalerProducts = wholesalerProducts.stream()
                .filter(p -> p.getCategory().equals(category))
                .collect(Collectors.toList());
        }
        
        model.addAttribute("products", wholesalerProducts);
        model.addAttribute("categories", productService.getAllCategories());
        model.addAttribute("user", retailer);
        return "retailer/marketplace";
    }
    
    @GetMapping("/product/{id}")
    public String viewWholesalerProduct(@PathVariable Long id, Authentication auth, Model model) {
        User retailer = userService.findByEmail(auth.getName());
        
        // Security check
        if (!isRetailer(retailer)) {
            return "redirect:/dashboard";
        }
        
        Product product = productService.getProductById(id);
        
        if (product.getSeller().getRole() != UserRole.WHOLESALER) {
            return "redirect:/retailer/marketplace";
        }
        
        model.addAttribute("product", product);
        model.addAttribute("user", retailer);
        return "retailer/wholesaler-product-details";
    }
    
    @PostMapping("/order/place")
    public String placeB2BOrder(@RequestParam Long productId,
                               @RequestParam Integer quantity,
                               @RequestParam(required = false) String specialInstructions,
                               Authentication auth,
                               RedirectAttributes redirectAttributes) {
        try {
            User retailer = userService.findByEmail(auth.getName());
            
            // Security check
            if (!isRetailer(retailer)) {
                return "redirect:/dashboard";
            }
            
            Product product = productService.getProductById(productId);
            
            if (product.getSeller().getRole() != UserRole.WHOLESALER) {
                throw new RuntimeException("Can only order from wholesalers");
            }
            
            if (product.getStockQuantity() < quantity) {
                throw new RuntimeException("Insufficient stock available");
            }
            
            // Create B2B order
            Order order = orderService.createB2BOrder(retailer, product, quantity, specialInstructions);
            
            redirectAttributes.addFlashAttribute("success", 
                "Order placed successfully! Order Number: " + order.getOrderNumber());
            return "redirect:/retailer/marketplace/orders";
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
            return "redirect:/retailer/marketplace";
        }
    }
    
    @GetMapping("/orders")
    public String viewB2BOrders(Authentication auth, Model model) {
        User retailer = userService.findByEmail(auth.getName());
        
        // Security check
        if (!isRetailer(retailer)) {
            return "redirect:/dashboard";
        }
        
        model.addAttribute("orders", orderService.getUserOrders(retailer));
        model.addAttribute("user", retailer);
        return "retailer/b2b-orders";
    }
}
