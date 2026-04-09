package com.zepro.dto.student;

public class StudentProfileResponse {
    
    private Long studentId;
    private String name;
    private String email;
    private String rollNumber;
    private double cgpa;
    private String year;
    private Long departmentId;
    private String departmentName;
    private String resumeLink;
    private String marksheetLink;
    private boolean isProfileComplete;

    public StudentProfileResponse(Long studentId, String name, String email, String rollNumber,
            double cgpa, String year, Long departmentId, String departmentName,
            String resumeLink, String marksheetLink, boolean isProfileComplete) {
        this.studentId = studentId;
        this.name = name;
        this.email = email;
        this.rollNumber = rollNumber;
        this.cgpa = cgpa;
        this.year = year;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.resumeLink = resumeLink;
        this.marksheetLink = marksheetLink;
        this.isProfileComplete = isProfileComplete;
    }

    // Getters & Setters
    public Long getStudentId() { return studentId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRollNumber() { return rollNumber; }
    public double getCgpa() { return cgpa; }
    public String getYear() { return year; }
    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
    public String getResumeLink() { return resumeLink; }
    public String getMarksheetLink() { return marksheetLink; }
    public boolean isProfileComplete() { return isProfileComplete; }
}