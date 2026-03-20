package com.zepro.dto.student;

public class AssignedProjectResponse {

<<<<<<< HEAD
    private Long projectId;
    private String title;
    private String description;
    private String facultyName;

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
=======
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
>>>>>>> origin/main
    }
}