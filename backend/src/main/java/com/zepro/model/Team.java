package com.zepro.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    private String teamName;

    private String status = "pending";

    @OneToOne
    private Student teamLead;

    @ManyToOne(fetch = FetchType.EAGER) // ✅ FIXED
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;

    @OneToMany(mappedBy = "team")
    private List<Student> members;

    // ── Getters ──────────────────────────────────────────────────────────────
    public Long getTeamId() {
        return teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public String getStatus() {
        return status;
    }

    public Student getTeamLead() {
        return teamLead;
    }

    public Faculty getFaculty() {
        return faculty;
    }

    public List<Student> getMembers() {
        return members;
    }

    // ── Setters ──────────────────────────────────────────────────────────────
    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setTeamLead(Student teamLead) {
        this.teamLead = teamLead;
    }

    public void setFaculty(Faculty faculty) {
        this.faculty = faculty;
    }

    public void setMembers(List<Student> members) {
        this.members = members;
    }
}