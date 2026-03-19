package com.zepro.dto.student;

public class CreateTeamRequest {

    private String teamName;
    private Long studentId;

    public String getTeamName() {
        return teamName;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }
}