
package com.zepro.dto.student;

import java.util.List;


public class TeamListResponse {

    private Long teamId;
    private String teamName;
    private String teamLead;
    private List<String> members;
    private boolean alreadyRequested;


    public TeamListResponse(Long teamId, String teamName, String teamLead, List<String> members, boolean alreadyRequested) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.teamLead = teamLead;
        this.members = members;
        this.alreadyRequested = alreadyRequested;
    }

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
    public boolean isAlreadyRequested() {
    return alreadyRequested;
}
}