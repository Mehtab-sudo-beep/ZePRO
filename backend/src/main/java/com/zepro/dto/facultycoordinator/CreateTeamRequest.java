package com.zepro.dto.facultycoordinator;

public class CreateTeamRequest {
    private String teamName;
    private Long studentId;

    public CreateTeamRequest() {}

    public CreateTeamRequest(String teamName, Long studentId) {
        this.teamName = teamName;
        this.studentId = studentId;
    }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
}