package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;

    private String title;

    private String description;

    @ManyToOne
    private Faculty faculty;

    @ManyToOne
    private Team team;

    private String status;

    private Integer studentSlots;

    @Column(name = "is_active", nullable = false, columnDefinition = "boolean default true")
    private boolean isActive = true;

    public Long getProjectId() { return projectId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public Faculty getFaculty() { return faculty; }
    public Team getTeam() { return team; }
    public String getStatus() { return status; }

    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setFaculty(Faculty faculty) { this.faculty = faculty; }
    public void setTeam(Team team) { this.team = team; }
    public void setStatus(String status) { this.status = status; }

    public Integer getStudentSlots() { return studentSlots; }
    public void setStudentSlots(Integer studentSlots) { this.studentSlots = studentSlots; }

    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
}