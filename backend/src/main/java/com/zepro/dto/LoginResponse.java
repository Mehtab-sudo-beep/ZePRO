package com.zepro.dto;

public class LoginResponse {

    private String token;
    private String role;
    private Long studentId;
    private boolean isInTeam;
    private boolean isTeamLead;
    private String name;
    private String email;

    public LoginResponse(String token, String role, Long studentId,
                         boolean isInTeam, boolean isTeamLead,
                         String name, String email) {
        this.token = token;
        this.role = role;
        this.studentId = studentId;
        this.isInTeam = isInTeam;
        this.isTeamLead = isTeamLead;
        this.name = name;
        this.email = email;
    }

    public String getToken()     { return token; }
    public String getRole()      { return role; }
    public Long getStudentId()   { return studentId; }
    public boolean isInTeam()    { return isInTeam; }
    public boolean isTeamLead()  { return isTeamLead; }
    public String getName()      { return name; }
    public String getEmail()     { return email; }
}