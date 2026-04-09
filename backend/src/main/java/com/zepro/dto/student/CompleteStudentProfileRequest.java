package com.zepro.dto.student;

public class CompleteStudentProfileRequest {
    
    private String rollNumber;
    private double cgpa;
    private String year;
    private Long departmentId;
    private Long instituteId;
    private String resumeLink;
    private String marksheetLink;

    // Getters & Setters
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public double getCgpa() { return cgpa; }
    public void setCgpa(double cgpa) { this.cgpa = cgpa; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getInstituteId() { return instituteId; }
    public void setInstituteId(Long instituteId) { this.instituteId = instituteId; }

    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }

    public String getMarksheetLink() { return marksheetLink; }
    public void setMarksheetLink(String marksheetLink) { this.marksheetLink = marksheetLink; }
}