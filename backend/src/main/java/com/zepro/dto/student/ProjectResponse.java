package com.zepro.dto.student;

public class ProjectResponse {

    private Long projectId;
    private String title;
    private String description;
    private String facultyName;
    private int slots;
    private String domain;
    private String subdomain;

    public ProjectResponse(Long projectId, String title, String description, String facultyName, int slots, String domain, String subdomain) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.facultyName = facultyName;
        this.slots = slots;
        this.domain = domain;
        this.subdomain = subdomain;
    }

    public Long getProjectId() { return projectId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getFacultyName() { return facultyName; }
    public int getSlots() { return slots; }
    public String getDomain() { return domain; }
    public String getSubdomain() { return subdomain; }
}