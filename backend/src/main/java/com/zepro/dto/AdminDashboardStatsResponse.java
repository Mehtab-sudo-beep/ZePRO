package com.zepro.dto;

public class AdminDashboardStatsResponse {
    
    private long totalInstitutes;
    private long totalDepartments;
    private long totalUsers;
    private long totalStudents;
    private long totalFaculty;

    public AdminDashboardStatsResponse(long totalInstitutes, long totalDepartments, 
            long totalUsers, long totalStudents, long totalFaculty) {
        this.totalInstitutes = totalInstitutes;
        this.totalDepartments = totalDepartments;
        this.totalUsers = totalUsers;
        this.totalStudents = totalStudents;
        this.totalFaculty = totalFaculty;
    }

    public long getTotalInstitutes() { return totalInstitutes; }
    public long getTotalDepartments() { return totalDepartments; }
    public long getTotalUsers() { return totalUsers; }
    public long getTotalStudents() { return totalStudents; }
    public long getTotalFaculty() { return totalFaculty; }
}