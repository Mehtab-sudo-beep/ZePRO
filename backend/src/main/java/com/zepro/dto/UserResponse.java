package com.zepro.dto;

import com.zepro.model.UserRole;

public class UserResponse {

    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private String rollNumber;
    private Boolean isFC;

    public UserResponse(Long userId, String name, String email, UserRole role) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public UserResponse(Long userId, String name, String email, UserRole role, String rollNumber) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.rollNumber = rollNumber;
    }

    public UserResponse(Long userId, String name, String email, UserRole role, String rollNumber, Boolean isFC) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.rollNumber = rollNumber;
        this.isFC = isFC;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRole() {
        return role;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public Boolean getIsFC() {
        return isFC;
    }

    public void setIsFC(Boolean isFC) {
        this.isFC = isFC;
    }
}