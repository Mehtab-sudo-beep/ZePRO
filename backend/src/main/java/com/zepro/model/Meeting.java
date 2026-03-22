package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long meetingId;

    @ManyToOne
    private ProjectRequest request;

    @ManyToOne
    private Team team;

    @ManyToOne
    private Project project;

    private String title;

    private String location;

    private String meetingLink;

    private LocalDateTime meetingTime;

    @Enumerated(EnumType.STRING)
    private MeetingStatus status; // SCHEDULED / CANCELLED / PENDING / DONE

    public Long getMeetingId() { return meetingId; }

    public ProjectRequest getRequest() { return request; }

    public Team getTeam() { return team; }

    public Project getProject() { return project; }

    public String getTitle() { return title; }

    public String getLocation() { return location; }

    public String getMeetingLink() { return meetingLink; }

    public LocalDateTime getMeetingTime() { return meetingTime; }

    public MeetingStatus getStatus() { return status; }

    public void setMeetingId(Long meetingId) { this.meetingId = meetingId; }

    public void setRequest(ProjectRequest request) { this.request = request; }

    public void setTeam(Team team) { this.team = team; }

    public void setProject(Project project) { this.project = project; }

    public void setTitle(String title) { this.title = title; }

    public void setLocation(String location) { this.location = location; }

    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public void setMeetingTime(LocalDateTime meetingTime) { this.meetingTime = meetingTime; }

    public void setStatus(MeetingStatus status) { this.status = status; }
}