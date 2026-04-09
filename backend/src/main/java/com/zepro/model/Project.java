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

    private String status; // OPEN or CLOSE

    private boolean isActive;

    @Column(name = "student_slots", nullable = false)
    private int studentSlots = 0; // ✅ NEW - tracks manually set slots

    // ✅ ADD THIS FIELD - Track max slots reached
    @Column(name = "maximum_slots_reached_till_now", nullable = false)
    private int maximumSlotsReachedTillNow = 0;

    // ─── Getters & Setters ─────────────────────────────────

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }

    public int getStudentSlots() { // ✅ NEW
        return studentSlots;
    }

    public void setStudentSlots(int studentSlots) { // ✅ NEW
        this.studentSlots = studentSlots;
    }

    public int getMaximumSlotsReachedTillNow() { return maximumSlotsReachedTillNow; }
    public void setMaximumSlotsReachedTillNow(int maximumSlotsReachedTillNow) { 
        this.maximumSlotsReachedTillNow = maximumSlotsReachedTillNow; 
    }
}