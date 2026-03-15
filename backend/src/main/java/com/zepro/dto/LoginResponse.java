package com.zepro.dto;

public class LoginResponse {

    private String token;
    private String role;
    private Long facultyId;

    public LoginResponse(String token, String role, Long facultyId) {
        this.token = token;
        this.role = role;
        this.facultyId = facultyId;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public Long getFacultyId() {
        return facultyId;
    }
}