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

    private Long studentId;
    private boolean isInTeam;
    private boolean isTeamLead;

    private String email;
    private String name;
    private String phone;

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
}