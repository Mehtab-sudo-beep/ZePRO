package com.zepro.dto.student;

public class ProjectResponse {
    
    private Long projectId;
    private String title;
    private String description;
    private String status;
    private String domain;
    private String subdomain;
    private boolean isActive;
    private int projectAssigned;
    private int maxSlots;
    private int remainingSlots;
    private String facultyName;    // ✅ NEW
    private Long facultyId;        // ✅ NEW

    // ✅ Constructor with faculty fields
    public ProjectResponse(Long projectId, String title, String description, String status,
            String domain, String subdomain, boolean isActive, int projectAssigned,
            int maxSlots, int remainingSlots, String facultyName, Long facultyId) {
        this.projectId = projectId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.domain = domain;
        this.subdomain = subdomain;
        this.isActive = isActive;
        this.projectAssigned = projectAssigned;
        this.maxSlots = maxSlots;
        this.remainingSlots = remainingSlots;
        this.facultyName = facultyName;
        this.facultyId = facultyId;
    }

    // Old constructor (keep for backward compatibility)
    public ProjectResponse(Long projectId, String title, String description, String status,
            String domain, String subdomain, boolean isActive, int projectAssigned,
            int maxSlots, int remainingSlots) {
        this(projectId, title, description, status, domain, subdomain, isActive,
                projectAssigned, maxSlots, remainingSlots, "N/A", null);
    }

    public ProjectResponse() {}

    // Getters and Setters
    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getSubdomain() { return subdomain; }
    public void setSubdomain(String subdomain) { this.subdomain = subdomain; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public int getProjectAssigned() { return projectAssigned; }
    public void setProjectAssigned(int projectAssigned) { this.projectAssigned = projectAssigned; }

    public int getMaxSlots() { return maxSlots; }
    public void setMaxSlots(int maxSlots) { this.maxSlots = maxSlots; }

    public int getRemainingSlots() { return remainingSlots; }
    public void setRemainingSlots(int remainingSlots) { this.remainingSlots = remainingSlots; }

    public String getFacultyName() { return facultyName; }           // ✅ NEW
    public void setFacultyName(String facultyName) { this.facultyName = facultyName; }

    public Long getFacultyId() { return facultyId; }                 // ✅ NEW
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
}