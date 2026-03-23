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

    public LoginResponse(String token, String role, Long facultyId, Long studentId,
                         boolean isInTeam, boolean isTeamLead) {
        this.token = token;
        this.role = role;
        this.facultyId = facultyId;
        this.studentId = studentId;
        this.isInTeam = isInTeam;
        this.isTeamLead = isTeamLead;
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