package com.zepro.dto.student;

public class HandleJoinRequestDTO {

    private Long requestId;
    private boolean accept;
    private String rejectionReason;

    public Long getRequestId() {
        return requestId;
    }

    public boolean isAccept() {
        return accept;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public void setAccept(boolean accept) {
        this.accept = accept;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}