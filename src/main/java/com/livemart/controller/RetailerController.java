package com.livemart.controller;

import com.livemart.model.*;
import com.livemart.service.*;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/retailer")
public class RetailerController {
    
    private final UserService userService;
    private final ProductService productService;
    private final OrderService orderService;
    private final NotificationService notificationService;
    
    public RetailerController(UserService userService, ProductService productService, 
                            OrderService orderService, NotificationService notificationService) {
        this.userService = userService;
        this.productService = productService;
        this.orderService = orderService;
        this.notificationService = notificationService;
    }
    
    @GetMapping("/products")
    public String viewMyProducts(Authentication auth, Model model) {
        try {
            User user = userService.findByEmail(auth.getName());
            model.addAttribute("products", productService.getProductsBySeller(user));
            model.addAttribute("user", user);
            model.addAttribute("unreadCount", notificationService.getUnreadCount(user));
            return "retailer/products";
        } catch (Exception e) {
            e.printStackTrace();
            return "redirect:/dashboard";
        }
    }
    
    @GetMapping("/product/add")
    public String showAddProductForm(Authentication auth, Model model) {
        try {
            User user = userService.findByEmail(auth.getName());
            model.addAttribute("user", user);
            model.addAttribute("isEdit", false);
            return "retailer/product-form";
        } catch (Exception e) {
            e.printStackTrace();
            return "redirect:/retailer/products";
        }
    }
    
    @PostMapping("/product/add")
    public String addProduct(@RequestParam String name,
                            @RequestParam(required = false) String description,
                            @RequestParam String category,
                            @RequestParam Double price,
                            @RequestParam Integer stockQuantity,
                            @RequestParam(required = false) String imageUrl,
                            @RequestParam Boolean available,
                            @RequestParam(defaultValue = "India") String manufacturingCountry,
                            Authentication auth, 
                            RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            
            Product product = new Product();
            product.setName(name);
            product.setDescription(description);
            product.setCategory(category);
            product.setPrice(price);
            product.setStockQuantity(stockQuantity);
            product.setImageUrl(imageUrl);
            product.setAvailable(available);
            product.setManufacturingCountry(manufacturingCountry);
            product.setSeller(user);
            
            productService.createProduct(product);
            redirectAttributes.addFlashAttribute("success", "Product added successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to add product: " + e.getMessage());
        }
        return "redirect:/retailer/products";
    }
    
    @GetMapping("/product/edit/{id}")
    public String showEditProductForm(@PathVariable Long id, Authentication auth, Model model, RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            Product product = productService.getProductById(id);
            
            if (!product.getSeller().getId().equals(user.getId())) {
                redirectAttributes.addFlashAttribute("error", "Unauthorized access!");
                return "redirect:/retailer/products";
            }
            
            model.addAttribute("product", product);
            model.addAttribute("user", user);
            model.addAttribute("isEdit", true);
            return "retailer/product-edit";
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Product not found!");
            return "redirect:/retailer/products";
        }
    }
    
    @PostMapping("/product/edit/{id}")
    public String editProduct(@PathVariable Long id,
                             @RequestParam String name,
                             @RequestParam(required = false) String description,
                             @RequestParam String category,
                             @RequestParam Double price,
                             @RequestParam Integer stockQuantity,
                             @RequestParam(required = false) String imageUrl,
                             @RequestParam Boolean available,
                             @RequestParam(defaultValue = "India") String manufacturingCountry,
                             Authentication auth,
                             RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            Product existing = productService.getProductById(id);
            
            if (!existing.getSeller().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized");
            }
            
            existing.setName(name);
            existing.setDescription(description);
            existing.setCategory(category);
            existing.setPrice(price);
            existing.setStockQuantity(stockQuantity);
            existing.setImageUrl(imageUrl);
            existing.setAvailable(available);
            existing.setManufacturingCountry(manufacturingCountry);
            
            productService.updateProduct(existing);
            redirectAttributes.addFlashAttribute("success", "Product updated successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to update product: " + e.getMessage());
        }
        return "redirect:/retailer/products";
    }
    
    @PostMapping("/product/restock/{id}")
    public String restockProduct(@PathVariable Long id,
                                @RequestParam Integer quantity,
                                Authentication auth,
                                RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            Product product = productService.getProductById(id);
            
            if (!product.getSeller().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized");
            }
            
            productService.restockProduct(id, quantity);
            redirectAttributes.addFlashAttribute("success", "Stock updated successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to update stock: " + e.getMessage());
        }
        return "redirect:/retailer/products";
    }
    
    @PostMapping("/product/delete/{id}")
    public String deleteProduct(@PathVariable Long id, Authentication auth, RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            Product product = productService.getProductById(id);
            
            if (!product.getSeller().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized");
            }
            
            productService.deleteProduct(id);
            redirectAttributes.addFlashAttribute("success", "Product deleted successfully!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/retailer/products";
    }
    
    @GetMapping("/orders")
    public String viewOrders(Authentication auth, Model model) {
        User user = userService.findByEmail(auth.getName());
        model.addAttribute("orders", orderService.getAllOrders());
        model.addAttribute("user", user);
        model.addAttribute("unreadCount", notificationService.getUnreadCount(user));
        return "retailer/orders";
    }
    
    @PostMapping("/order/update-status")
    public String updateOrderStatus(@RequestParam Long orderId,
                                   @RequestParam OrderStatus status,
                                   RedirectAttributes redirectAttributes) {
        try {
            orderService.updateOrderStatus(orderId, status);
            redirectAttributes.addFlashAttribute("success", "Order status updated!");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/retailer/orders";
    }
}
