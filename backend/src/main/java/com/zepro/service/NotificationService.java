package com.zepro.service;

import com.zepro.dto.NotificationDTO;
import com.zepro.model.Notification;
import com.zepro.model.Users;
import com.zepro.repository.NotificationRepository;
import com.zepro.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PushNotificationService pushNotificationService;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository, PushNotificationService pushNotificationService) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.pushNotificationService = pushNotificationService;
    }

    public List<NotificationDTO> getUserNotifications(String email) {
        List<Notification> notifications = notificationRepository.findByUser_EmailOrderByCreatedAtDesc(email);
        return notifications.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public int getUnreadCount(String email) {
        return notificationRepository.countByUser_EmailAndIsReadFalse(email);
    }

    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    public void markAllAsRead(String email) {
        List<Notification> unread = notificationRepository.findByUser_EmailOrderByCreatedAtDesc(email)
                .stream().filter(n -> !n.isRead()).collect(Collectors.toList());
        
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    // Main method to create and send a notification
    public void createAndSendNotification(Users targetUser, String title, String body, String targetScreen, String targetId) {
        if (targetUser == null) return;

        // 1. Save to Database
        Notification notification = new Notification();
        notification.setUser(targetUser);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setTargetScreen(targetScreen);
        notification.setTargetId(targetId);
        notificationRepository.save(notification);

        // 2. Send Push Notification if enabled and token exists
        if (targetUser.isPushNotifications() && targetUser.getExpoPushToken() != null && !targetUser.getExpoPushToken().isEmpty()) {
            Map<String, String> data = new HashMap<>();
            data.put("targetScreen", targetScreen != null ? targetScreen : "");
            data.put("targetId", targetId != null ? targetId : "");
            
            System.out.println("[NotificationService] Sending push to token: " + targetUser.getExpoPushToken());
            pushNotificationService.sendPushNotification(
                    targetUser.getExpoPushToken(), 
                    title, 
                    body, 
                    data
            );
        } else {
             System.out.println("[NotificationService] Push skipped (disabled or no token) for user: " + targetUser.getEmail());
        }
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return new NotificationDTO(
                notification.getId(),
                notification.getTitle(),
                notification.getBody(),
                notification.getTargetScreen(),
                notification.getTargetId(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
