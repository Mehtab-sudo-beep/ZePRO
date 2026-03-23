package com.zepro.dto.student;

public class CreateTeamRequest {

    private String teamName;
    private String description;
    private Long studentId;

    public String getTeamName() {
        return teamName;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getDescription() {
        return description;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}