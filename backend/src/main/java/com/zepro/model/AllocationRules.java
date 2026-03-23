package com.zepro.model;

import jakarta.persistence.*;

@Entity
@Table(name = "allocation_rules")
public class AllocationRules {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "max_team_size", nullable = false)
    private int maxTeamSize=4;

    @Column(name = "max_students_per_faculty", nullable = false)
    private int maxStudentsPerFaculty=10;

    // ─── Getters & Setters ───────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(int maxTeamSize) { this.maxTeamSize = maxTeamSize; }

    public int getMaxStudentsPerFaculty() { return maxStudentsPerFaculty; }
    public void setMaxStudentsPerFaculty(int maxStudentsPerFaculty) {
        this.maxStudentsPerFaculty = maxStudentsPerFaculty;
    }
}