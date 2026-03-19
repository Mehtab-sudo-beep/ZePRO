package com.zepro.dto.student;

public class AssignedProjectResponse {

    private String teamName;
    private String projectTitle;

    public AssignedProjectResponse() {}

    public String getTeamName() {
        return teamName;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setProjectTitle(String projectTitle) {
        this.projectTitle = projectTitle;
    }
}