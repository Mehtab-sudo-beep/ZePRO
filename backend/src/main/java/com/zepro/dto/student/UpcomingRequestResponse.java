package com.zepro.dto.student;

import java.time.LocalDateTime;

public class UpcomingRequestResponse {
    private Long requestId;
    private String projectTitle;
    private String facultyName;
    private LocalDateTime meetingTime;
    private String location;
    private String meetingLink;

    // ✅ Empty constructor
    public UpcomingRequestResponse() {}

    public UpcomingRequestResponse(Long requestId,
                                   String projectTitle,
                                   String facultyName,
                                   LocalDateTime meetingTime,
                                   String location,
                                   String meetingLink) {

        this.requestId = requestId;
        this.projectTitle = projectTitle;
        this.facultyName = facultyName;
        this.meetingTime = meetingTime;
        this.location = location;
        this.meetingLink = meetingLink;
    }       
    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public LocalDateTime getMeetingTime() { return meetingTime; }
    public void setMeetingTime(LocalDateTime meetingTime) { this.meetingTime = meetingTime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }
}