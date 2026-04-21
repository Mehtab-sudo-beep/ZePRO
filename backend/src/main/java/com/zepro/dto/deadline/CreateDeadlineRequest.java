package com.zepro.dto.deadline;

import com.zepro.model.UserRole;
import java.time.LocalDateTime;

public class CreateDeadlineRequest {
    private String title;
    private String description;
    private LocalDateTime deadlineDate;
    private UserRole roleSpecificity;
    private String degree;

    public CreateDeadlineRequest() {}

    public CreateDeadlineRequest(String title, String description, LocalDateTime deadlineDate, 
                               UserRole roleSpecificity, String degree) {
        this.title = title;
        this.description = description;
        this.deadlineDate = deadlineDate;
        this.roleSpecificity = roleSpecificity;
        this.degree = degree;
    }

    // Getters and Setters
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getDeadlineDate() { return deadlineDate; }
    public void setDeadlineDate(LocalDateTime deadlineDate) { this.deadlineDate = deadlineDate; }

    public UserRole getRoleSpecificity() { return roleSpecificity; }
    public void setRoleSpecificity(UserRole roleSpecificity) { this.roleSpecificity = roleSpecificity; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
}