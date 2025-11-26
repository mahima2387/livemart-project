package com.livemart.service;

import com.livemart.model.Product;
import com.livemart.model.User;
import com.livemart.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {
    
    private final ProductRepository productRepository;
    
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }
    
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Product not found"));
    }
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public List<Product> getAvailableProducts() {
        return productRepository.findByAvailableTrue();
    }
    
    public List<Product> getProductsBySeller(User seller) {
        return productRepository.findBySeller(seller);
    }
    
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }
    
    public List<Product> searchProducts(String keyword) {
        return productRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(keyword, keyword);
    }
    
    public List<Product> filterProducts(String category, Double minPrice, Double maxPrice, Boolean inStock) {
        List<Product> products = getAvailableProducts();
        
        // Filter by category
        if (category != null && !category.isEmpty() && !category.equals("all")) {
            products = products.stream()
                .filter(p -> p.getCategory().equalsIgnoreCase(category))
                .collect(Collectors.toList());
        }
        
        // Filter by price range
        if (minPrice != null) {
            products = products.stream()
                .filter(p -> p.getPrice() >= minPrice)
                .collect(Collectors.toList());
        }
        
        if (maxPrice != null) {
            products = products.stream()
                .filter(p -> p.getPrice() <= maxPrice)
                .collect(Collectors.toList());
        }
        
        // Filter by stock availability
        if (inStock != null && inStock) {
            products = products.stream()
                .filter(p -> p.getStockQuantity() > 0)
                .collect(Collectors.toList());
        }
        
        return products;
    }
    
    public List<String> getAllCategories() {
        return productRepository.findAll().stream()
            .map(Product::getCategory)
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }
    
    public Product updateProduct(Product product) {
        Product existing = getProductById(product.getId());
        existing.setName(product.getName());
        existing.setDescription(product.getDescription());
        existing.setCategory(product.getCategory());
        existing.setPrice(product.getPrice());
        existing.setStockQuantity(product.getStockQuantity());
        existing.setImageUrl(product.getImageUrl());
        existing.setAvailable(product.getAvailable());
        existing.setManufacturingCountry(product.getManufacturingCountry());
        return productRepository.save(existing);
    }
    
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }
    
    public void restockProduct(Long productId, Integer quantity) {
        Product product = getProductById(productId);
        product.setStockQuantity(product.getStockQuantity() + quantity);
        productRepository.save(product);
    }
    
    public void reduceStock(Long productId, Integer quantity) {
        Product product = getProductById(productId);
        if (product.getStockQuantity() < quantity) {
            throw new RuntimeException("Insufficient stock");
        }
        product.setStockQuantity(product.getStockQuantity() - quantity);
        productRepository.save(product);
    }
}
