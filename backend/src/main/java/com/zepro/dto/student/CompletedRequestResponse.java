package com.zepro.dto.student;

public class CompletedRequestResponse {
    private Long requestId;
    private String projectTitle;
    private String facultyName;
    private String status;
    private String rejectionReason;

    // ✅ Empty constructor
    public CompletedRequestResponse() {}

    public CompletedRequestResponse(Long requestId,
                                    String projectTitle,
                                    String facultyName,
                                    String status,
                                    String rejectionReason) {

        this.requestId = requestId;
        this.projectTitle = projectTitle;
        this.facultyName = facultyName;
        this.status = status;
        this.rejectionReason = rejectionReason;
    }

    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getFacultyName() { return facultyName; }
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}