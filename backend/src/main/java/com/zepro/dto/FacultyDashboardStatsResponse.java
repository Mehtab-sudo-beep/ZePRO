package com.zepro.dto;

public class FacultyDashboardStatsResponse {
    
    private Long facultyId;
    private String name;
    private String department;
    private long allocatedStudents;
    private long maxCapacity;
    private long projectsCount;
    private String role;

    public FacultyDashboardStatsResponse(Long facultyId, String name, String department,
            long allocatedStudents, long maxCapacity, long projectsCount, String role) {
        this.facultyId = facultyId;
        this.name = name;
        this.department = department;
        this.allocatedStudents = allocatedStudents;
        this.maxCapacity = maxCapacity;
        this.projectsCount = projectsCount;
        this.role = role;
    }

    public Long getFacultyId() { return facultyId; }
    public String getName() { return name; }
    public String getDepartment() { return department; }
    public long getAllocatedStudents() { return allocatedStudents; }
    public long getMaxCapacity() { return maxCapacity; }
    public long getProjectsCount() { return projectsCount; }
    public String getRole() { return role; }
}