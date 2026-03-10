package com.zepro.dto.student;

public class HandleJoinRequestDTO {

    private Long requestId;
    private boolean accept;

    public Long getRequestId() {
        return requestId;
    }

    public boolean isAccept() {
        return accept;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public void setAccept(boolean accept) {
        this.accept = accept;
    }
}