package com.zepro.dto.student;

public class SentRequestResponse {

    private Long requestId;
    private String teamName;
    private String teamLead;
    private String status;
    private String rejectionReason;

    public SentRequestResponse(Long requestId, String teamName, String teamLead, String status,
            String rejectionReason) {
        this.requestId = requestId;
        this.teamName = teamName;
        this.teamLead = teamLead;
        this.status = status;
        this.rejectionReason = rejectionReason;
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

    public String getRejectionReason() {
        return rejectionReason;
    }
}