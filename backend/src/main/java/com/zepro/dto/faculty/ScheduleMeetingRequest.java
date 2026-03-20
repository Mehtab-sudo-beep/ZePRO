package com.zepro.dto.faculty;

import java.time.LocalDateTime;

public class ScheduleMeetingRequest {

    private Long requestId;
    private Long teamId;
    private Long projectId;

    private String title;
    private String location;
    private String meetingLink;

    private LocalDateTime meetingTime;

    public Long getRequestId() { return requestId; }
    public Long getTeamId() { return teamId; }
    public Long getProjectId() { return projectId; }

    public String getTitle() { return title; }
    public String getLocation() { return location; }
    public String getMeetingLink() { return meetingLink; }

    public LocalDateTime getMeetingTime() { return meetingTime; }

    public void setRequestId(Long requestId) { this.requestId = requestId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public void setTitle(String title) { this.title = title; }
    public void setLocation(String location) { this.location = location; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public void setMeetingTime(LocalDateTime meetingTime) { this.meetingTime = meetingTime; }
}