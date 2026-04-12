package com.zepro.dto.facultycoordinator;

public class FacultyProjectDTO {
    private Long projectId;
    private String projectTitle;
    private String status;
    private int studentSlots;

    public FacultyProjectDTO(Long projectId, String projectTitle, String status, int studentSlots) {
        this.projectId = projectId;
        this.projectTitle = projectTitle;
        this.status = status;
        this.studentSlots = studentSlots;
    }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getProjectTitle() { return projectTitle; }
    public void setProjectTitle(String projectTitle) { this.projectTitle = projectTitle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getStudentSlots() { return studentSlots; }
    public void setStudentSlots(int studentSlots) { this.studentSlots = studentSlots; }
}