package com.zepro.model;

import jakarta.persistence.*;

@Entity
@Table(name = "allocation_rules")
public class AllocationRules {

    @Id
    private Long id = 1L;

    @Column(name = "max_team_size", nullable = false)
    private int maxTeamSize;

    @Column(name = "max_students_per_faculty", nullable = false)
    private int maxStudentsPerFaculty;

    @Column(name = "max_projects_per_faculty", nullable = false)
    private int maxProjectsPerFaculty;

    @Column(name = "max_slots_per_project", nullable = false)

    // ─── Getters & Setters ─────────────────────────────────

    public Long getId() {
        return id;
    }

    public int getMaxTeamSize() {
        return maxTeamSize;
    }

    public void setMaxTeamSize(int maxTeamSize) {
        this.maxTeamSize = maxTeamSize;
    }

    public int getMaxStudentsPerFaculty() {
        return maxStudentsPerFaculty;
    }

    public void setMaxStudentsPerFaculty(int maxStudentsPerFaculty) {
        this.maxStudentsPerFaculty = maxStudentsPerFaculty;
    }

    public int getMaxProjectsPerFaculty() {
        return maxProjectsPerFaculty;
    }

    public void setMaxProjectsPerFaculty(int maxProjectsPerFaculty) {
        this.maxProjectsPerFaculty = maxProjectsPerFaculty;
    }

    
}