package com.zepro.dto.facultycoordinator;

public class AllocateTeamRequest {
    private Long teamId;
    private Long facultyId;
    private Long projectId;

    public AllocateTeamRequest() {}

    public AllocateTeamRequest(Long teamId, Long facultyId, Long projectId) {
        this.teamId = teamId;
        this.facultyId = facultyId;
        this.projectId = projectId;
    }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
}