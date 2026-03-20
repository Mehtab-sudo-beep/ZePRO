package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class ProjectRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    @ManyToOne
    private Faculty faculty;

    @ManyToOne
    private Team team;

    @ManyToOne
    private Team team;

    @ManyToOne
    private Project project;

    private String status; // PENDING / APPROVED / REJECTED

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public Faculty getFaculty() {
        return faculty;
    }

    public void setFaculty(Faculty faculty) {
        this.faculty = faculty;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }
    public Project getProject() {
        return project;
    }

    public String getStatus() {
        return status;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}