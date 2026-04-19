package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "department_deadlines")
public class DepartmentDeadlines {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(name = "team_formation_deadline")
    private LocalDateTime teamFormationDeadline;

    @Column(name = "project_request_deadline")
    private LocalDateTime projectRequestDeadline;

    @Column(name = "meeting_scheduling_deadline")
    private LocalDateTime meetingSchedulingDeadline;

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public LocalDateTime getTeamFormationDeadline() {
        return teamFormationDeadline;
    }

    public void setTeamFormationDeadline(LocalDateTime teamFormationDeadline) {
        this.teamFormationDeadline = teamFormationDeadline;
    }

    public LocalDateTime getProjectRequestDeadline() {
        return projectRequestDeadline;
    }

    public void setProjectRequestDeadline(LocalDateTime projectRequestDeadline) {
        this.projectRequestDeadline = projectRequestDeadline;
    }

    public LocalDateTime getMeetingSchedulingDeadline() {
        return meetingSchedulingDeadline;
    }

    public void setMeetingSchedulingDeadline(LocalDateTime meetingSchedulingDeadline) {
        this.meetingSchedulingDeadline = meetingSchedulingDeadline;
    }
}
