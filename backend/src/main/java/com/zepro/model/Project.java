package com.zepro.model;

import jakarta.persistence.*;

@Entity
@Table(name = "projects")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;

    @Column(name = "title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // ✅ NEW: Track status history for reactivation
    @Column(name = "present_status")
    private String presentStatus = "OPEN";

    @Column(name = "previous_status")
    private String previousStatus = "OPEN";

    @ManyToOne
    private Faculty faculty;

    @ManyToOne
    private Team team;

    @Column(name = "status")
    private String status = "OPEN";

    @Column(name = "student_slots")
    private Integer studentSlots;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "maximum_slots_reached_till_now")
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

    public int getStudentSlots() {
        return studentSlots;
    }

    public void setStudentSlots(int studentSlots) {
        this.studentSlots = studentSlots;
    }

    public int getMaximumSlotsReachedTillNow() { return maximumSlotsReachedTillNow; }
    public void setMaximumSlotsReachedTillNow(int maximumSlotsReachedTillNow) { 
        this.maximumSlotsReachedTillNow = maximumSlotsReachedTillNow; 
    }

    // ✅ NEW: Getters and Setters for status tracking
    public String getPresentStatus() {
        return presentStatus;
    }

    public void setPresentStatus(String presentStatus) {
        this.presentStatus = presentStatus;
        this.status = presentStatus; // Keep synchronized
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    // ✅ Helper method to update status with history
    public void updateStatusWithHistory(String newStatus) {
        this.previousStatus = this.presentStatus;
        this.presentStatus = newStatus;
        this.status = newStatus;
    }
}