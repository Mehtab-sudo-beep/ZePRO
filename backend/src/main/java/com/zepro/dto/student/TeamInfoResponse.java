package com.zepro.dto.student;

import java.util.List;

public class TeamInfoResponse {
    private Long teamId;
    private String teamName;
    private String teamLead;
    private List<TeamMemberDTO> members;
private Long teamLeadId;
    // getters and setters
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public String getTeamLead() { return teamLead; }
    public void setTeamLead(String teamLead) { this.teamLead = teamLead; }
    public List<TeamMemberDTO> getMembers() { return members; }
    public void setMembers(List<TeamMemberDTO> members) { this.members = members; }
public Long getTeamLeadId() { return teamLeadId; }
public void setTeamLeadId(Long teamLeadId) { this.teamLeadId = teamLeadId; }
}