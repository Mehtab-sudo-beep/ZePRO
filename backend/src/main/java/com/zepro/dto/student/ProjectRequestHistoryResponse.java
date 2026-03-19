package com.zepro.dto.student;

public class ProjectRequestHistoryResponse {

    private Long requestId;
    private String projectTitle;
    private String facultyName;
    private String status;

    public ProjectRequestHistoryResponse(Long requestId, String projectTitle, String facultyName, String status) {
        this.requestId = requestId;
        this.projectTitle = projectTitle;
        this.facultyName = facultyName;
        this.status = status;
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
}