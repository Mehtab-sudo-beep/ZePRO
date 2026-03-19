package com.zepro.dto.student;

public class SendJoinRequestDTO {

    private Long studentId;
    private Long teamId;

    public Long getStudentId() {
        return studentId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }
}