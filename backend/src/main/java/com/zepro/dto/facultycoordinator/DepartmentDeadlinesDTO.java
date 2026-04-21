package com.zepro.dto.facultycoordinator;

import java.time.LocalDateTime;

public class DepartmentDeadlinesDTO {
    
    private LocalDateTime teamFormationDeadline;
    private LocalDateTime projectRequestDeadline;
    private LocalDateTime meetingSchedulingDeadline;
    private String degree;

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

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }
}
