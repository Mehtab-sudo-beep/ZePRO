package com.zepro.dto;

public class CreateProjectRequest {

    private String title;
    private String description;
    private Long facultyId;

    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Long getFacultyId() { return facultyId; }

    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
}