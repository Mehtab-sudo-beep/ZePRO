package com.zepro.controller;

import com.zepro.dto.NotificationDTO;
import com.zepro.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<?> getUserNotifications(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        String email = authentication.getName();
        List<NotificationDTO> notifications = notificationService.getUserNotifications(email);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        String email = authentication.getName();
        int count = notificationService.getUnreadCount(email);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).body("Unauthorized");
        String email = authentication.getName();
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok().build();
    }
}
