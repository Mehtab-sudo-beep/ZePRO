package com.zepro.dto.student;

public class StudentProfileStatusResponse {
    
    private Long studentId;
    private boolean isComplete;
    private String rollNumber;
    private double cgpa;
    private String year;
    private Long departmentId;
    private String resumeLink;
    private String marksheetLink;

    public StudentProfileStatusResponse(Long studentId, boolean isComplete, String rollNumber,
            double cgpa, String year, Long departmentId, String resumeLink, String marksheetLink) {
        this.studentId = studentId;
        this.isComplete = isComplete;
        this.rollNumber = rollNumber;
        this.cgpa = cgpa;
        this.year = year;
        this.departmentId = departmentId;
        this.resumeLink = resumeLink;
        this.marksheetLink = marksheetLink;
    }

    // Getters
    public Long getStudentId() { return studentId; }
    public boolean isComplete() { return isComplete; }
    public String getRollNumber() { return rollNumber; }
    public double getCgpa() { return cgpa; }
    public String getYear() { return year; }
    public Long getDepartmentId() { return departmentId; }
    public String getResumeLink() { return resumeLink; }
    public String getMarksheetLink() { return marksheetLink; }
}