package com.zepro.dto.student;

public class SentRequestResponse {

    private Long requestId;
    private String teamName;
    private String teamLead;
    private String status;

    public SentRequestResponse(Long requestId, String teamName, String teamLead, String status) {
        this.requestId = requestId;
        this.teamName = teamName;
        this.teamLead = teamLead;
        this.status = status;
    }

    public Long getRequestId() {
        return requestId;
    }

    public String getTeamName() {
        return teamName;
    }

    public String getTeamLead() {
        return teamLead;
    }

    public String getStatus() {
        return status;
    }
}