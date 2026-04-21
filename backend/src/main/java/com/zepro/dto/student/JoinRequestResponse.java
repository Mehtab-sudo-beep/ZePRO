package com.zepro.dto.student;

public class JoinRequestResponse {

    private Long requestId;
    private Long studentId;
    private String studentName;
    private String status;
    private String rejectionReason;
    private String studentEmail;

    public JoinRequestResponse(Long requestId, Long studentId, String studentName, String status,
            String rejectionReason, String studentEmail) {
        this.requestId = requestId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.studentEmail = studentEmail;
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

    public String getRejectionReason() {
        return rejectionReason;
    }

    public String getStudentEmail() {
        return studentEmail;
    }
}