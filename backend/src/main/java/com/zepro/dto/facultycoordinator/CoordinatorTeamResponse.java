package com.zepro.dto.facultycoordinator;

import java.util.List;

public class CoordinatorTeamResponse {
     private Long   teamId;
    private String teamName;      // Team.teamName
    private String projectTitle;  // Team's assigned Project.title (nullable)
    private Long   facultyId;     // Faculty.facultyId (nullable)
    private String facultyName;   // Faculty.user.name (nullable)
    private String status;        // Team.status: active / completed / pending
    private List<TeamMemberInfo> members; // Team.members mapped to TeamMemberInfo
 
    public CoordinatorTeamResponse() {}
 
    public CoordinatorTeamResponse(Long teamId, String teamName, String projectTitle,
                                    Long facultyId, String facultyName, String status,
                                    List<TeamMemberInfo> members) {
        this.teamId       = teamId;
        this.teamName     = teamName;
        this.projectTitle = projectTitle;
        this.facultyId    = facultyId;
        this.facultyName  = facultyName;
        this.status       = status;
        this.members      = members;
    }
 
    public Long   getTeamId()       { return teamId; }
    public String getTeamName()     { return teamName; }
    public String getProjectTitle() { return projectTitle; }
    public Long   getFacultyId()    { return facultyId; }
    public String getFacultyName()  { return facultyName; }
    public String getStatus()       { return status; }
    public List<TeamMemberInfo> getMembers() { return members; }
 
    public void setTeamId(Long v)       { this.teamId = v; }
    public void setTeamName(String v)   { this.teamName = v; }
    public void setProjectTitle(String v) { this.projectTitle = v; }
    public void setFacultyId(Long v)    { this.facultyId = v; }
    public void setFacultyName(String v){ this.facultyName = v; }
    public void setStatus(String v)     { this.status = v; }
    public void setMembers(List<TeamMemberInfo> v) { this.members = v; }
}