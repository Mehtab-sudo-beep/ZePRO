package com.zepro.dto;

import java.time.LocalDateTime;

public class NotificationDTO {
    private Long id;
    private String title;
    private String body;
    private String targetScreen;
    private String targetId;
    private boolean isRead;
    private LocalDateTime createdAt;

    // Constructors
    public NotificationDTO() {}

    public NotificationDTO(Long id, String title, String body, String targetScreen, String targetId, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.body = body;
        this.targetScreen = targetScreen;
        this.targetId = targetId;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }
    
    public String getTargetScreen() { return targetScreen; }
    public void setTargetScreen(String targetScreen) { this.targetScreen = targetScreen; }
    
    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
    
    public boolean getIsRead() { return isRead; }
    public void setIsRead(boolean isRead) { this.isRead = isRead; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
