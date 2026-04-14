package com.zepro.dto.facultycoordinator;

import java.time.LocalDateTime;

public class DepartmentDeadlinesDTO {
    
    private LocalDateTime teamFormationDeadline;
    private LocalDateTime meetingSchedulingDeadline;

    public LocalDateTime getTeamFormationDeadline() {
        return teamFormationDeadline;
    }

    public void setTeamFormationDeadline(LocalDateTime teamFormationDeadline) {
        this.teamFormationDeadline = teamFormationDeadline;
    }

    public LocalDateTime getMeetingSchedulingDeadline() {
        return meetingSchedulingDeadline;
    }

    public void setMeetingSchedulingDeadline(LocalDateTime meetingSchedulingDeadline) {
        this.meetingSchedulingDeadline = meetingSchedulingDeadline;
    }
}
