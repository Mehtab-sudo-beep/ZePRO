package com.zepro.dto.facultycoordinator;

public class JoinTeamRequest {
    private Long studentId;
    private Long teamId;

    public JoinTeamRequest() {}

    public JoinTeamRequest(Long studentId, Long teamId) {
        this.studentId = studentId;
        this.teamId = teamId;
    }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
}