package com.zepro.dto;

import com.zepro.model.UserRole;

public class OAuthSignupRequest {
    private String email;
    private String name;
    private String oauthProvider; // "google", "github", etc.
    private String oauthId;
    private UserRole role;
    private String profilePictureUrl;

    public OAuthSignupRequest() {}

    public OAuthSignupRequest(String email, String name, String oauthProvider, 
                             String oauthId, UserRole role, String profilePictureUrl) {
        this.email = email;
        this.name = name;
        this.oauthProvider = oauthProvider;
        this.oauthId = oauthId;
        this.role = role;
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOauthProvider() { return oauthProvider; }
    public void setOauthProvider(String oauthProvider) { this.oauthProvider = oauthProvider; }

    public String getOauthId() { return oauthId; }
    public void setOauthId(String oauthId) { this.oauthId = oauthId; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
}