package com.zepro.dto.student;

public class AssignedProjectResponse {

    private Long projectId;
    private String title;
    private String description;
    private String facultyName;
    private String teamName;
    private String projectTitle;
    private String status;

    public AssignedProjectResponse() {}

    public Long getProjectId() {
        return projectId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public String getTeamName() {
        return teamName;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public String getStatus() {
        return status;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}