package com.zepro.dto;

public class LoginResponse {

    private String token;
    private String role;
    private Long studentId;

    public LoginResponse(String token, String role, Long studentId) {
        this.token = token;
        this.role = role;
        this.studentId = studentId;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public Long getStudentId() {
        return studentId;
    }
}