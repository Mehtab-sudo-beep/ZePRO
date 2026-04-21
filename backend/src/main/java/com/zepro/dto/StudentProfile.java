package com.zepro.dto;

public class StudentProfile {

    private String name;
    private String email;

    private String department;
    private Boolean isInTeam;
    private Boolean isTeamLead;
    private String teamName;
    private String institute;
    private String resumeLink;
    private String marksheetLink;
    private Boolean isAllocated;
    private String degree;

    // getters & setters

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getInstitute() { return institute; }
    public void setInstitute(String institute) { this.institute = institute; }

    public Boolean getIsInTeam() { return isInTeam; }
    public void setIsInTeam(Boolean isInTeam) { this.isInTeam = isInTeam; }

    public Boolean getIsTeamLead() { return isTeamLead; }
    public void setIsTeamLead(Boolean isTeamLead) { this.isTeamLead = isTeamLead; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }

    public String getMarksheetLink() { return marksheetLink; }
    public void setMarksheetLink(String marksheetLink) { this.marksheetLink = marksheetLink; }

    public Boolean getIsAllocated() { return isAllocated; }
    public void setIsAllocated(Boolean isAllocated) { this.isAllocated = isAllocated; }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }
}