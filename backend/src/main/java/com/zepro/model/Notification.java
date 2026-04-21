package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    private String title;
    
    @Column(length = 1000)
    private String body;

    // Used for navigation, e.g. "MeetingDetails", "ProjectDetails"
    private String targetScreen;
    
    // ID if needed for navigation, e.g. requestId or meetingId
    private String targetId;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    // ---------- GETTERS ----------
    public Long getId() { return id; }
    public Users getUser() { return user; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public String getTargetScreen() { return targetScreen; }
    public String getTargetId() { return targetId; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // ---------- SETTERS ----------
    public void setId(Long id) { this.id = id; }
    public void setUser(Users user) { this.user = user; }
    public void setTitle(String title) { this.title = title; }
    public void setBody(String body) { this.body = body; }
    public void setTargetScreen(String targetScreen) { this.targetScreen = targetScreen; }
    public void setTargetId(String targetId) { this.targetId = targetId; }
    public void setRead(boolean read) { isRead = read; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
