package com.zepro.dto;

import com.zepro.model.UserRole;

public class GoogleLoginRequest {
    private String idToken;
    private UserRole role; // Expected role for new users (e.g., STUDENT, FACULTY)

    public GoogleLoginRequest() {}

    public GoogleLoginRequest(String idToken, UserRole role) {
        this.idToken = idToken;
        this.role = role;
    }

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}
