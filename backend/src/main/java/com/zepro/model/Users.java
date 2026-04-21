package com.zepro.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class Users {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String phone;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    // ✅ NEW: OAuth fields
    private String oauthProvider;
    private String oauthId;
    private String profilePictureUrl;
    private boolean isOAuthUser = false;

    @Column(columnDefinition = "boolean default true")
    private boolean emailNotifications = true;

    @Column(columnDefinition = "boolean default true")
    private boolean pushNotifications = true;

    // ---------- GETTERS ----------

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getPhone() {
        return phone;
    }

    public UserRole getRole() {
        return role;
    }

    public String getOauthProvider() {
        return oauthProvider;
    }

    public String getOauthId() {
        return oauthId;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public boolean isOAuthUser() {
        return isOAuthUser;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public boolean isPushNotifications() {
        return pushNotifications;
    }

    // ---------- SETTERS ----------

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public void setOauthProvider(String oauthProvider) {
        this.oauthProvider = oauthProvider;
    }

    public void setOauthId(String oauthId) {
        this.oauthId = oauthId;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    public void setOAuthUser(boolean oAuthUser) {
        this.isOAuthUser = oAuthUser;
    }

    public void setEmailNotifications(boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }

    public void setPushNotifications(boolean pushNotifications) {
        this.pushNotifications = pushNotifications;
    }
}