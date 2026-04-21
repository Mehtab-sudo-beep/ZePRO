package com.zepro.dto.student;

import java.util.List;

public class MeetingDetailsResponse {

    private String title;
    private String faculty;
    private String projectName;
    private String domain;
    private String subDomain;
    private String description;
    private String location;
    private String date;
    private String time;
    private String meetingLink;
    private String teamName;
    private List<String> members;
    private List<String> documents;
    private Long projectId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getFaculty() { return faculty; }
    public void setFaculty(String faculty) { this.faculty = faculty; }

    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getSubDomain() { return subDomain; }
    public void setSubDomain(String subDomain) { this.subDomain = subDomain; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public List<String> getMembers() { return members; }
    public void setMembers(List<String> members) { this.members = members; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public List<String> getDocuments() { return documents; }
    public void setDocuments(List<String> documents) { this.documents = documents; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }
}