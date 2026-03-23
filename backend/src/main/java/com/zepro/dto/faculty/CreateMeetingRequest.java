package com.zepro.dto.faculty;

import java.time.LocalDateTime;

public class CreateMeetingRequest {

    private Long requestId;
    private LocalDateTime meetingTime;
    private String meetingLink;
    private String location;
    private String title;

     public String getTitle() {
        return title;
    }
    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public LocalDateTime getMeetingTime() {
        return meetingTime;
    }

    public void setMeetingTime(LocalDateTime meetingTime) {
        this.meetingTime = meetingTime;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}