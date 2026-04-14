package com.zepro.dto;

public class DepartmentStatsResponse {
    
    private Long departmentId;
    private String departmentName;
    private long studentCount;
    private long facultyCount;
    private long projectCount;

    public DepartmentStatsResponse(Long departmentId, String departmentName, 
            long studentCount, long facultyCount, long projectCount) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.studentCount = studentCount;
        this.facultyCount = facultyCount;
        this.projectCount = projectCount;
    }

    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
    public long getStudentCount() { return studentCount; }
    public long getFacultyCount() { return facultyCount; }
    public long getProjectCount() { return projectCount; }
}