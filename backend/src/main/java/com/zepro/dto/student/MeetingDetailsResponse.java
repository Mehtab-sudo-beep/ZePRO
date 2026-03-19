package com.zepro.dto.student;

import java.util.List;

public class MeetingDetailsResponse {

    private String title;
    private String faculty;
    private String projectName;
    private String domain;
    private String subDomain;
    private String location;
    private String date;
    private String time;
    private List<String> members;

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
}