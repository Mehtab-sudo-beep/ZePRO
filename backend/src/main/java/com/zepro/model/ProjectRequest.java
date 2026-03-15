package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class ProjectRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    private String status;

    @ManyToOne
    private Faculty faculty;

    @ManyToOne
    private Team team;

    public Long getRequestId() { return requestId; }

    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public String getStatus() { return status; }

    public void setStatus(String status) { this.status = status; }

    public Faculty getFaculty() { return faculty; }

    public void setFaculty(Faculty faculty) { this.faculty = faculty; }

    public Team getTeam() { return team; }

    public void setTeam(Team team) { this.team = team; }
}