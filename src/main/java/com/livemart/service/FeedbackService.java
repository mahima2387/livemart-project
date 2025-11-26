package com.livemart.service;

import com.livemart.model.Feedback;
import com.livemart.model.Product;
import com.livemart.model.User;
import com.livemart.repository.FeedbackRepository;
import com.livemart.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {
    
    private final FeedbackRepository feedbackRepository;
    private final ProductRepository productRepository;
    
    public FeedbackService(FeedbackRepository feedbackRepository, ProductRepository productRepository) {
        this.feedbackRepository = feedbackRepository;
        this.productRepository = productRepository;
    }
    
    public Feedback createFeedback(User customer, Long productId, Integer rating, String comment) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        // Check if user already gave feedback for this product
        if (feedbackRepository.findByCustomerAndProduct(customer, product).isPresent()) {
            throw new RuntimeException("You have already submitted feedback for this product");
        }
        
        // Use constructor to create feedback
        Feedback feedback = new Feedback();
        feedback.setId(null);
        feedback.setCustomer(customer);
        feedback.setProduct(product);
        feedback.setRating(rating);
        feedback.setComment(comment);
        feedback.setCreatedAt(LocalDateTime.now());
        
        return feedbackRepository.save(feedback);
    }
    
    public List<Feedback> getProductFeedbacks(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return feedbackRepository.findByProductOrderByCreatedAtDesc(product);
    }
    
    public Double getAverageRating(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        Double avg = feedbackRepository.getAverageRating(product);
        return avg != null ? avg : 0.0;
    }
    
    public Long getTotalReviews(Long productId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new RuntimeException("Product not found"));
        return feedbackRepository.getTotalReviews(product);
    }
}
