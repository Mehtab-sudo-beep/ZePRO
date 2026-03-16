package com.zepro.dto.faculty;

import java.util.List;

public class ProjectResponse {

    private Long projectId;
    private Long requestId;   // ← ADD THIS

    private String title;
    private String description;
    private String status;

    private Long teamId;
    private String teamName;
    private String teamLead;

    private List<String> teamMembers;

    public ProjectResponse(){}

    public ProjectResponse(Long projectId, String title, String description, String status) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.status = status;
    }

    // getters setters

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    // NEW
    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getTeamLead() { return teamLead; }
    public void setTeamLead(String teamLead) { this.teamLead = teamLead; }

    public List<String> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<String> teamMembers) { this.teamMembers = teamMembers; }
}