package com.zepro.dto;

public class LoginResponse {

    private String token;
    private String role;
    private Long facultyId;
    private Long studentId;
    private boolean isInTeam;
    private boolean isTeamLead;
    private String email;
    private String name;
    private String phone;
    private boolean isFC;
    private boolean emailNotifications;
    private boolean pushNotifications;
    private String profilePictureUrl;
    private boolean profileComplete;

    public LoginResponse(String token, String role, Long facultyId) {
        this.token = token;
        this.role = role;
        this.facultyId = facultyId;
    }

    public LoginResponse(String token, String role, Long facultyId, Long studentId,
                         boolean isInTeam, boolean isTeamLead, String email, String name, String phone) {
        this.token = token;
        this.role = role;
        this.facultyId = facultyId;
        this.studentId = studentId;
        this.isInTeam = isInTeam;
        this.isTeamLead = isTeamLead;
        this.email = email;
        this.name = name;
        this.phone = phone;
    }

    public LoginResponse(String token, String role, Long facultyId, Long studentId,
                         boolean isInTeam, boolean isTeamLead, String email, String name, String phone, boolean isFC,
                         boolean emailNotifications, boolean pushNotifications, String profilePictureUrl, boolean profileComplete) {
        this.token = token;
        this.role = role;
        this.facultyId = facultyId;
        this.studentId = studentId;
        this.isInTeam = isInTeam;
        this.isTeamLead = isTeamLead;
        this.email = email;
        this.name = name;
        this.phone = phone;
        this.isFC = isFC;
        this.emailNotifications = emailNotifications;
        this.pushNotifications = pushNotifications;
        this.profilePictureUrl = profilePictureUrl;
        this.profileComplete = profileComplete;
    }

    public boolean isProfileComplete() {
        return profileComplete;
    }

    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getPhone() { return phone; }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public boolean isInTeam() {
        return isInTeam;
    }

    public boolean isTeamLead() {
        return isTeamLead;
    }

    public boolean isFC() {
        return isFC;
    }

    public void setFC(boolean isFC) {
        this.isFC = isFC;
    }

    public boolean isEmailNotifications() {
        return emailNotifications;
    }

    public boolean isPushNotifications() {
        return pushNotifications;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
}