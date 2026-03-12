package com.zepro.dto;

import com.zepro.model.UserRole;

public class UserResponse {

    private Long userId;
    private String name;
    private String email;
    private UserRole role;

    public UserResponse(Long userId, String name, String email, UserRole role) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
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
    //no set functions beacuse once user is created , immutable
}