package com.zepro.dto.facultycoordinator;

import java.util.List;

public class CoordinatorTeamDetailDTO {
    private Long teamId;
    private String teamName;
    private String projectTitle;
    private Long facultyId;
    private String facultyName;
    private String status;
    private List<String> memberNames;
    private int memberCount;
    private int maxSlots;
    private boolean isFull;

    public CoordinatorTeamDetailDTO(Long teamId, String teamName, String projectTitle, Long facultyId,
            String facultyName, String status, List<String> memberNames, int memberCount, int maxSlots) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.projectTitle = projectTitle;
        this.facultyId = facultyId;
        this.facultyName = facultyName;
        this.status = status;
        this.memberNames = memberNames;
        this.memberCount = memberCount;
        this.maxSlots = maxSlots;
        this.isFull = memberCount >= maxSlots;
    }

    // Getters and Setters
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<String> getMemberNames() { return memberNames; }
    public void setMemberNames(List<String> memberNames) { this.memberNames = memberNames; }

    public int getMemberCount() { return memberCount; }
    public void setMemberCount(int memberCount) { this.memberCount = memberCount; }

    public int getMaxSlots() { return maxSlots; }
    public void setMaxSlots(int maxSlots) { this.maxSlots = maxSlots; }

    public boolean isFull() { return isFull; }
    public void setFull(boolean full) { isFull = full; }
}