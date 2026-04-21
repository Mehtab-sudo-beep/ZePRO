package com.zepro.dto.student;

public class JoinRequestResponse {

    private Long requestId;
    private Long studentId;
    private String studentName;
    private String status;
    private String rejectionReason;
    private String studentEmail;
    private String studentRollNumber;
    private double cgpa;
    private String resumeLink;
    private String marksheetLink;

    public JoinRequestResponse(Long requestId, Long studentId, String studentName, String status,
            String rejectionReason, String studentEmail, String studentRollNumber, double cgpa,
            String resumeLink, String marksheetLink) {
        this.requestId = requestId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.studentEmail = studentEmail;
        this.studentRollNumber = studentRollNumber;
        this.cgpa = cgpa;
        this.resumeLink = resumeLink;
        this.marksheetLink = marksheetLink;
    }

    public String getStudentRollNumber() { return studentRollNumber; }
    public double getCgpa() { return cgpa; }
    public String getResumeLink() { return resumeLink; }
    public String getMarksheetLink() { return marksheetLink; }

    public Long getRequestId() {
        return requestId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public String getStatus() {
        return status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public String getStudentEmail() {
        return studentEmail;
    }
}