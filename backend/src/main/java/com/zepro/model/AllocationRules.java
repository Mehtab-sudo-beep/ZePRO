package com.zepro.model;

import jakarta.persistence.*;

@Entity
@Table(name = "allocation_rules")
public class AllocationRules {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "max_team_size", nullable = false)
    private int maxTeamSize = 4;

    @Column(name = "max_students_per_faculty", nullable = false)
    private int maxStudentsPerFaculty = 10;

    @Column(name = "max_projects_per_faculty", nullable = false)
    private int maxProjectsPerFaculty = 3;

    @Column(name = "max_slots_per_project", nullable = false)
    private int maxSlotsPerProject = 5;

    // ✅ ADD DEPARTMENT & INSTITUTE RELATIONS
    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "institute_id")
    private Institute institute;

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

    public int getMaxSlotsPerProject() {
        return maxSlotsPerProject;
    }

    public void setMaxSlotsPerProject(int maxSlotsPerProject) {
        this.maxSlotsPerProject = maxSlotsPerProject;
    }

    // ✅ ADD DEPARTMENT & INSTITUTE GETTERS/SETTERS
    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public Institute getInstitute() {
        return institute;
    }

    public void setInstitute(Institute institute) {
        this.institute = institute;
    }
}