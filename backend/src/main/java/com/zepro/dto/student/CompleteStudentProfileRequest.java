package com.zepro.dto.student;

import org.springframework.web.multipart.MultipartFile;

public class CompleteStudentProfileRequest {
    private String rollNumber;
    private Double cgpa;
    private String year;
    private Long instituteId;
    private Long departmentId;
    private MultipartFile resumeFile;
    private MultipartFile marksheetFile;
    
    // ✅ ADD PHONE FIELD
    private String phone;

    public CompleteStudentProfileRequest() {}

    public CompleteStudentProfileRequest(
            String rollNumber,
            Double cgpa,
            String year,
            Long instituteId,
            Long departmentId,
            MultipartFile resumeFile,
            MultipartFile marksheetFile,
            String phone) {
        this.rollNumber = rollNumber;
        this.cgpa = cgpa;
        this.year = year;
        this.instituteId = instituteId;
        this.departmentId = departmentId;
        this.resumeFile = resumeFile;
        this.marksheetFile = marksheetFile;
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

    public MultipartFile getResumeFile() { return resumeFile; }
    public void setResumeFile(MultipartFile resumeFile) { this.resumeFile = resumeFile; }

    public MultipartFile getMarksheetFile() { return marksheetFile; }
    public void setMarksheetFile(MultipartFile marksheetFile) { this.marksheetFile = marksheetFile; }

    // ✅ PHONE GETTERS & SETTERS
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}