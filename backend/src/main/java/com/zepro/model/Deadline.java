package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.zepro.model.UserRole;
@Entity
@Table(name = "deadlines")
public class Deadline {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deadlineId;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime deadlineDate;
    
    @Column(nullable = false)
    private Boolean isActive = true;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole roleSpecificity;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Deadline() {}

    public Deadline(String title, String description, LocalDateTime deadlineDate, 
                 UserRole roleSpecificity) {
        this.title = title;
        this.description = description;
        this.deadlineDate = deadlineDate;
        this.roleSpecificity = roleSpecificity;
        this.isActive = true;
    }

    // Getters and Setters
    public Long getDeadlineId() { return deadlineId; }
    public void setDeadlineId(Long deadlineId) { this.deadlineId = deadlineId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(LocalDateTime deadlineDate) { this.deadlineDate = deadlineDate; }

    

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public UserRole getRoleSpecificity() { return roleSpecificity; }
    public void setRoleSpecificity(UserRole roleSpecificity) { this.roleSpecificity = roleSpecificity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}