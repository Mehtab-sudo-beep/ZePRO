package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class ProjectRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne
    private Team team;

    @ManyToOne
    private Project project;

    private String status; // PENDING / APPROVED / REJECTED

    public Long getRequestId() {
        return requestId;
    }

    public Team getTeam() {
        return team;
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