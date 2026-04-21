package com.zepro.dto;

public class StudentDashboardStatsResponse {
    
    private Long studentId;
    private String name;
    private String department;
    private double cgpa;
    private String degree;
    private boolean isAllocated;
    private boolean isInTeam;
    private boolean isTeamLead;
    private long projectsCount;

    public StudentDashboardStatsResponse(Long studentId, String name, String department,
            double cgpa, String degree, boolean isAllocated, boolean isInTeam, 
            boolean isTeamLead, long projectsCount) {
        this.studentId = studentId;
        this.name = name;
        this.department = department;
        this.cgpa = cgpa;
        this.degree = degree;
        this.isAllocated = isAllocated;
        this.isInTeam = isInTeam;
        this.isTeamLead = isTeamLead;
        this.projectsCount = projectsCount;
    }

    public Long getStudentId() { return studentId; }
    public String getName() { return name; }
    public String getDepartment() { return department; }
    public double getCgpa() { return cgpa; }
    public String getDegree() { return degree; }
    public boolean isAllocated() { return isAllocated; }
    public boolean isInTeam() { return isInTeam; }
    public boolean isTeamLead() { return isTeamLead; }
    public long getProjectsCount() { return projectsCount; }
}