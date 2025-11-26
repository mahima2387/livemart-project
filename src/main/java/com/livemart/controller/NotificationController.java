package com.livemart.controller;

import com.livemart.model.User;
import com.livemart.service.NotificationService;
import com.livemart.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/notifications")
public class NotificationController {
    
    private final NotificationService notificationService;
    private final UserService userService;
    
    public NotificationController(NotificationService notificationService, UserService userService) {
        this.notificationService = notificationService;
        this.userService = userService;
    }
    
    @GetMapping
    public String viewNotifications(Authentication auth, Model model) {
        User user = userService.findByEmail(auth.getName());
        model.addAttribute("notifications", notificationService.getUserNotifications(user));
        model.addAttribute("unreadCount", notificationService.getUnreadCount(user));
        model.addAttribute("user", user);
        return "notifications";
    }
    
    @PostMapping("/mark-read/{id}")
    public String markAsRead(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            notificationService.markAsRead(id);
            redirectAttributes.addFlashAttribute("success", "Notification marked as read");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/notifications";
    }
    
    @PostMapping("/mark-all-read")
    public String markAllAsRead(Authentication auth, RedirectAttributes redirectAttributes) {
        try {
            User user = userService.findByEmail(auth.getName());
            notificationService.markAllAsRead(user);
            redirectAttributes.addFlashAttribute("success", "All notifications marked as read");
        } catch (Exception e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/notifications";
    }
}
