package com.zepro.dto;

public class UpdateProfileRequest {
    private String name;
    private String email;

    public String getName() { return name; }
    public void setName(String v) { this.name = v; }
    public String getEmail() { return email; }
    public void setEmail(String v) { this.email = v; }
}