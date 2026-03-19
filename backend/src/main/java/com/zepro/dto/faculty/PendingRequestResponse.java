package com.zepro.dto.faculty;

import java.util.List;

public class PendingRequestResponse {

    private Long requestId;
    private Long projectId;
    private String title;
    private String description;
    private String status;

    private Long teamId;
    private String teamName;
    private String teamLead;
    private List<String> teamMembers;

    public Long getRequestId() { return requestId; }
    public Long getProjectId() { return projectId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }

    public Long getTeamId() { return teamId; }
    public String getTeamName() { return teamName; }
    public String getTeamLead() { return teamLead; }
    public List<String> getTeamMembers() { return teamMembers; }

    public void setRequestId(Long requestId) { this.requestId = requestId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setStatus(String status) { this.status = status; }

    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public void setTeamLead(String teamLead) { this.teamLead = teamLead; }
    public void setTeamMembers(List<String> teamMembers) { this.teamMembers = teamMembers; }
}