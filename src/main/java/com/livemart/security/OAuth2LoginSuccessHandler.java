package com.livemart.security;

import com.livemart.model.User;
import com.livemart.model.UserRole;
import com.livemart.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

@Component
public class OAuth2LoginSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    public OAuth2LoginSuccessHandler(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                       Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        
        // Check if user exists
        if (!userRepository.existsByEmail(email)) {
            // Create new user with CUSTOMER role by default
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setFullName(name);
            newUser.setRole(UserRole.CUSTOMER); // Default role
            newUser.setEnabled(true);
            newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            newUser.setPhone(""); // Can be updated later
            newUser.setAddress("Not provided");
            newUser.setCity("Not provided");
            newUser.setState("Not provided");
            newUser.setPincode("000000");
            
            userRepository.save(newUser);
        }
        
        // Redirect to dashboard
        response.sendRedirect("/dashboard");
    }
}
