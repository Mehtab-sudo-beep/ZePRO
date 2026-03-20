package com.zepro.dto.student;

public class JoinRequestResponse {

    private Long requestId;
    private Long studentId;
    private String studentName;
    private String status;

    public JoinRequestResponse(Long requestId, Long studentId, String studentName, String status) {
        this.requestId = requestId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.status = status;
    }

    public Long getRequestId() {
        return requestId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStatus() {
        return status;
    }
}