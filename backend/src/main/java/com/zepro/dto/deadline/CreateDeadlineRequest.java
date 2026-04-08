package com.zepro.dto.deadline;

import com.zepro.model.UserRole;
import java.time.LocalDateTime;

public class CreateDeadlineRequest {
    
    private String title;
    private String description;
    private LocalDateTime deadlineDate;
    private Boolean isAutomatic;
    private UserRole roleSpecificity;

    public CreateDeadlineRequest() {}

    public CreateDeadlineRequest(String title, String description, LocalDateTime deadlineDate,
                                 Boolean isAutomatic, UserRole roleSpecificity) {
        this.title = title;
        this.description = description;
        this.deadlineDate = deadlineDate;
        this.isAutomatic = isAutomatic;
        this.roleSpecificity = roleSpecificity;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(LocalDateTime deadlineDate) { this.deadlineDate = deadlineDate; }

    public Boolean getIsAutomatic() { return isAutomatic; }
    public void setIsAutomatic(Boolean isAutomatic) { this.isAutomatic = isAutomatic; }

    public UserRole getRoleSpecificity() { return roleSpecificity; }
    public void setRoleSpecificity(UserRole roleSpecificity) { this.roleSpecificity = roleSpecificity; }
}