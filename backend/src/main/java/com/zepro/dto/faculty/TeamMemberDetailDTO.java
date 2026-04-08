package com.zepro.dto.faculty;

public class TeamMemberDetailDTO {
    
    private Long studentId;
    private String name;
    private String rollNo;
    private String email;
    private Double cgpa;
    private String resumeLink;
    private String marksheetLink;
    private boolean isTeamLead;

    public TeamMemberDetailDTO(Long studentId, String name, String rollNo, String email,
            Double cgpa, String resumeLink, String marksheetLink, boolean isTeamLead) {
        this.studentId = studentId;
        this.name = name;
        this.rollNo = rollNo;
        this.email = email;
        this.cgpa = cgpa;
        this.resumeLink = resumeLink;
        this.marksheetLink = marksheetLink;
        this.isTeamLead = isTeamLead;
    }

    // Getters and Setters
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRollNo() { return rollNo; }
    public void setRollNo(String rollNo) { this.rollNo = rollNo; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }

    public String getMarksheetLink() { return marksheetLink; }
    public void setMarksheetLink(String marksheetLink) { this.marksheetLink = marksheetLink; }

    public boolean isTeamLead() { return isTeamLead; }
    public void setTeamLead(boolean teamLead) { isTeamLead = teamLead; }
}