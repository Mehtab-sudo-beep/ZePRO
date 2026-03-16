package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long meetingId;

    @OneToOne
    @JoinColumn(name = "request_id")
    private ProjectRequest request;

    private LocalDateTime meetingTime;

    private String meetingLink;

    @Enumerated(EnumType.STRING)
    private MeetingStatus status;

    public Long getMeetingId() {
        return meetingId;
    }

    public ProjectRequest getRequest() {
        return request;
    }

    public void setRequest(ProjectRequest request) {
        this.request = request;
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

    public MeetingStatus getStatus() {
        return status;
    }

    public void setStatus(MeetingStatus status) {
        this.status = status;
    }
}