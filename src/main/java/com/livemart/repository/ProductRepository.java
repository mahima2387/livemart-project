package com.livemart.repository;

import com.livemart.model.Product;
import com.livemart.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findBySeller(User seller);
    
    List<Product> findByAvailableTrue();
    
    List<Product> findByCategory(String category);
    
    List<Product> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
}
