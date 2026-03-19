package com.zepro.dto.student;

import java.util.List;

public class TeamResponse {

    private Long teamId;
    private String teamName;
    private String teamLead;
    private List<String> members;

    public Long getTeamId() {
        return teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public String getTeamLead() {
        return teamLead;
    }

    public List<String> getMembers() {
        return members;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setTeamLead(String teamLead) {
        this.teamLead = teamLead;
    }

    public void setMembers(List<String> members) {
        this.members = members;
    }
}