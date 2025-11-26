package com.livemart.repository;

import com.livemart.model.Feedback;
import com.livemart.model.Product;
import com.livemart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    List<Feedback> findByProductOrderByCreatedAtDesc(Product product);
    
    Optional<Feedback> findByCustomerAndProduct(User customer, Product product);
    
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.product = :product")
    Double getAverageRating(Product product);
    
    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.product = :product")
    Long getTotalReviews(Product product);
}
