package com.zepro.dto;

public class ProjectResponse {

    private Long projectId;
    private String title;
    private String description;
    private String status;

    public ProjectResponse(Long projectId, String title, String description, String status) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.status = status;
    }

    public Long getProjectId() { return projectId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
}