package com.zepro.dto.faculty;

import java.util.List;

public class ProjectResponse {

    private Long projectId;
    private Long requestId;

    private String title;
    private String description;
    private String status;
    private boolean isActive;

    private Long teamId;
    private String teamName;
    private String teamLead;

    // ✅ FIXED NAME
    private List<String> members;

    private String domain;
    private String subdomain;
    private int assignedStudents;
    private int maxSlots;
    private int presentSlots;

    private List<TeamMemberDetailDTO> teamMemberDetails;
    private String teamMembersNames;
    private String teamMembersRollNumbers;
    private String teamMembersCgpas;
    private String teamMembersResumeLinks;
    private String teamMembersMarkSheetLinks;

    public ProjectResponse() {}

    // 🔥 Constructor for projects
    public ProjectResponse(Long projectId, String title, String description,
                           String status, String domain, String subdomain, boolean isActive, 
                           int assignedStudents, int maxSlots,int presentSlots) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.domain = domain;
        this.subdomain = subdomain;
        this.isActive = isActive;
        this.assignedStudents = assignedStudents;
        this.maxSlots = maxSlots;
        this.presentSlots = presentSlots;
    }

    // 🔥 Optional full constructor
    public ProjectResponse(Long projectId, Long requestId, String title, String description,
                           String status, Long teamId, String teamName,
                           String teamLead, List<String> members,
                           String domain, String subdomain, 
                           int assignedStudents, int maxSlots,int presentSlots) {

        this.projectId = projectId;
        this.requestId = requestId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.teamId = teamId;
        this.teamName = teamName;
        this.teamLead = teamLead;
        this.members = members;
        this.domain = domain;
        this.subdomain = subdomain;
        this.assignedStudents = assignedStudents;
        this.maxSlots = maxSlots;
        this.presentSlots = presentSlots;
    }

    // ---------------- GETTERS & SETTERS ----------------
    
    public int getAssignedStudents() { return assignedStudents; }
    public void setAssignedStudents(int assignedStudents) { this.assignedStudents = assignedStudents; }

    public int getMaxSlots() { return maxSlots; }
    public void setMaxSlots(int maxSlots) { this.maxSlots = maxSlots; }

    public int getPresentSlots() { return presentSlots; }
    public void setPresentSlots(int presentSlots) { this.presentSlots = presentSlots; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public Long getRequestId() { return requestId; }
    public void setRequestId(Long requestId) { this.requestId = requestId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getTeamLead() { return teamLead; }
    public void setTeamLead(String teamLead) { this.teamLead = teamLead; }

    // ✅ FIXED (IMPORTANT)
    public List<String> getMembers() { return members; }
    public void setMembers(List<String> members) { this.members = members; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getSubdomain() { return subdomain; }
    public void setSubdomain(String subdomain) { this.subdomain = subdomain; }

    public List<TeamMemberDetailDTO> getTeamMemberDetails() { return teamMemberDetails; }
    public void setTeamMemberDetails(List<TeamMemberDetailDTO> teamMemberDetails) { this.teamMemberDetails = teamMemberDetails; }

    public String getTeamMembersNames() { return teamMembersNames; }
    public void setTeamMembersNames(String teamMembersNames) { this.teamMembersNames = teamMembersNames; }

    public String getTeamMembersRollNumbers() { return teamMembersRollNumbers; }
    public void setTeamMembersRollNumbers(String teamMembersRollNumbers) { this.teamMembersRollNumbers = teamMembersRollNumbers; }

    public String getTeamMembersCgpas() { return teamMembersCgpas; }
    public void setTeamMembersCgpas(String teamMembersCgpas) { this.teamMembersCgpas = teamMembersCgpas; }

    public String getTeamMembersResumeLinks() { return teamMembersResumeLinks; }
    public void setTeamMembersResumeLinks(String teamMembersResumeLinks) { this.teamMembersResumeLinks = teamMembersResumeLinks; }

    public String getTeamMembersMarkSheetLinks() { return teamMembersMarkSheetLinks; }
    public void setTeamMembersMarkSheetLinks(String teamMembersMarkSheetLinks) { this.teamMembersMarkSheetLinks = teamMembersMarkSheetLinks; }
}