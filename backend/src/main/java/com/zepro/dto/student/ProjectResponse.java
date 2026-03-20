package com.zepro.dto.student;

public class ProjectResponse {

    private Long projectId;
    private String title;
    private String description;
    private String facultyName;
    private int slots;

    public ProjectResponse(Long projectId, String title, String description, String facultyName, int slots) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.facultyName = facultyName;
        this.slots = slots;
    }

    public Long getProjectId() { return projectId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getFacultyName() { return facultyName; }
    public int getSlots() { return slots; }
}