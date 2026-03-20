package com.zepro.dto.student;

public class ProjectStatusDTO {
    private Long projectId;
    private String title;
    private String status; // REQUESTED, ACCEPTED, REJECTED, etc.
    private String facultyName;

    // getters and setters
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }
}