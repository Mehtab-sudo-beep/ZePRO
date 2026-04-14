package com.zepro.dto.student;

public class TransferLeadRequest {
    private Long teamId;
    private Long currentLeadId;
    private Long newLeadId;

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public Long getCurrentLeadId() {
        return currentLeadId;
    }

    public void setCurrentLeadId(Long currentLeadId) {
        this.currentLeadId = currentLeadId;
    }

    public Long getNewLeadId() {
        return newLeadId;
    }

    public void setNewLeadId(Long newLeadId) {
        this.newLeadId = newLeadId;
    }
}
