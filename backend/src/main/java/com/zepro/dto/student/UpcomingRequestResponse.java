package com.zepro.dto.student;

import java.time.LocalDateTime;

public class UpcomingRequestResponse {
    private Long requestId;
    private String projectTitle;
    private String facultyName;
    private LocalDateTime meetingTime;
    private String location;
    private String meetingLink;

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
    public String getFacultyName() { return facultyName; }
    public LocalDateTime getMeetingTime() { return meetingTime; }
    public String getLocation() { return location; }
    public String getMeetingLink() { return meetingLink; }
}