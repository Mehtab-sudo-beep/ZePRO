package com.zepro.dto.student;

public class CompleteStudentProfileRequest {
    private String rollNumber;
    private Double cgpa;
    private String year;
    private Long instituteId;
    private Long departmentId;
    private String resumeLink;
    private String marksheetLink;
    
    // ✅ ADD PHONE FIELD
    private String phone;

    public CompleteStudentProfileRequest() {}

    public CompleteStudentProfileRequest(
            String rollNumber,
            Double cgpa,
            String year,
            Long instituteId,
            Long departmentId,
            String resumeLink,
            String marksheetLink,
            String phone) {
        this.rollNumber = rollNumber;
        this.cgpa = cgpa;
        this.year = year;
        this.instituteId = instituteId;
        this.departmentId = departmentId;
        this.resumeLink = resumeLink;
        this.marksheetLink = marksheetLink;
        this.phone = phone;
    }

    // Getters & Setters
    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public Long getInstituteId() { return instituteId; }
    public void setInstituteId(Long instituteId) { this.instituteId = instituteId; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }

    public String getMarksheetLink() { return marksheetLink; }
    public void setMarksheetLink(String marksheetLink) { this.marksheetLink = marksheetLink; }

    // ✅ PHONE GETTERS & SETTERS
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}