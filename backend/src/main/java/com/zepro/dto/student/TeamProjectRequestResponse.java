package com.zepro.dto.student;

public class TeamProjectRequestResponse {

    private Long requestId;
    private String projectTitle;
    private String facultyName;
    private String status;
    private String rejectionReason;

    public TeamProjectRequestResponse(Long requestId, String projectTitle, String facultyName, String status, String rejectionReason) {
        this.requestId = requestId;
        this.projectTitle = projectTitle;
        this.facultyName = facultyName;
        this.status = status;
        this.rejectionReason = rejectionReason;
    }

    public Long getRequestId() {
        return requestId;
    }

    public String getProjectTitle() {
        return projectTitle;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public String getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }
}
