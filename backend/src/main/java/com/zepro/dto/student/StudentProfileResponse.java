package com.zepro.dto.student;

public class StudentProfileResponse {
    private Long studentId;
    private String name;
    private String email;
    private String rollNumber;
    private Double cgpa;
    private String year;
    private Long departmentId;
    private String departmentName;
    private String resumeLink;
    private String marksheetLink;
    private String phone;
    private boolean isProfileComplete;

    public StudentProfileResponse() {}

    public StudentProfileResponse(
            Long studentId,
            String name,
            String email,
            String rollNumber,
            Double cgpa,
            String year,
            Long departmentId,
            String departmentName,
            String resumeLink,
            String marksheetLink,
            String phone,
            boolean isProfileComplete) {
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
        this.phone = phone;
        this.isProfileComplete = isProfileComplete;
    }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }

    public String getMarksheetLink() { return marksheetLink; }
    public void setMarksheetLink(String marksheetLink) { this.marksheetLink = marksheetLink; }

    public boolean isProfileComplete() { return isProfileComplete; }
    public void setProfileComplete(boolean profileComplete) { this.isProfileComplete = profileComplete; }
}