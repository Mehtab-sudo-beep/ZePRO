package com.zepro.dto.student;

public class ProjectResponse {

    private Long projectId;
    private String title;
    private String description;
    private String status;
    private String domain;
    private String subdomain;
    private boolean isActive;
    private int assignedStudents;
    private int maxSlots;
    private int remainingSlots;

    // ✅ Constructor matching StudentService.getAllProjects()
    public ProjectResponse(Long projectId, String title, String description, 
                          String status, String domain, String subdomain, 
                          boolean isActive, int assignedStudents, 
                          int maxSlots, int remainingSlots) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.domain = domain;
        this.subdomain = subdomain;
        this.isActive = isActive;
        this.assignedStudents = assignedStudents;
        this.maxSlots = maxSlots;
        this.remainingSlots = remainingSlots;
    }

    // ✅ Getters
    public Long getProjectId() { return projectId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public String getDomain() { return domain; }
    public String getSubdomain() { return subdomain; }
    public boolean getIsActive() { return isActive; }
    public int getAssignedStudents() { return assignedStudents; }
    public int getMaxSlots() { return maxSlots; }
    public int getRemainingSlots() { return remainingSlots; }

    // ✅ Setters
    public void setProjectId(Long projectId) { this.projectId = projectId; }
    public void setTitle(String title) { this.title = title; }
    public void setDescription(String description) { this.description = description; }
    public void setStatus(String status) { this.status = status; }
    public void setDomain(String domain) { this.domain = domain; }
    public void setSubdomain(String subdomain) { this.subdomain = subdomain; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
    public void setAssignedStudents(int assignedStudents) { this.assignedStudents = assignedStudents; }
    public void setMaxSlots(int maxSlots) { this.maxSlots = maxSlots; }
    public void setRemainingSlots(int remainingSlots) { this.remainingSlots = remainingSlots; }
}