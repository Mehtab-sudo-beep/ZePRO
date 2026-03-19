package com.zepro.dto.student;

public class ProjectRequestDTO {

    private Long studentId;
    private Long projectId;

    public Long getStudentId() {
        return studentId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }
}