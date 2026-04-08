package com.zepro.dto.deadline;

import com.zepro.model.UserRole;
import java.time.LocalDateTime;

public class DeadlineResponse {
    
    private Long deadlineId;
    private String title;
    private String description;
    private LocalDateTime deadlineDate;
    private Boolean isActive;
    private UserRole roleSpecificity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isPassed;

    public DeadlineResponse(Long deadlineId, String title, String description, LocalDateTime deadlineDate,
                 Boolean isActive, UserRole roleSpecificity,
                           LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.deadlineId = deadlineId;
        this.title = title;
        this.description = description;
        this.deadlineDate = deadlineDate;
        this.isActive = isActive;
        this.roleSpecificity = roleSpecificity;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isPassed = LocalDateTime.now().isAfter(deadlineDate);
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

    public Boolean getIsPassed() { return isPassed; }
    public void setIsPassed(Boolean isPassed) { this.isPassed = isPassed; }
}