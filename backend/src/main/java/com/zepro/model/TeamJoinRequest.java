package com.zepro.model;

import jakarta.persistence.*;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = { "student_id", "team_id" }))
public class TeamJoinRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    private String status; // PENDING, APPROVED, REJECTED

    private String rejectionReason;

    private String studentName;
    private String studentRollNumber;
    private double cgpa;
    private String resumeLink;
    private String marksheetLink;

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentRollNumber() { return studentRollNumber; }
    public void setStudentRollNumber(String studentRollNumber) { this.studentRollNumber = studentRollNumber; }

    public double getCgpa() { return cgpa; }
    public void setCgpa(double cgpa) { this.cgpa = cgpa; }

    public String getResumeLink() { return resumeLink; }
    public void setResumeLink(String resumeLink) { this.resumeLink = resumeLink; }

    public String getMarksheetLink() { return marksheetLink; }
    public void setMarksheetLink(String marksheetLink) { this.marksheetLink = marksheetLink; }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public Long getRequestId() {
        return requestId;
    }

    public Student getStudent() {
        return student;
    }

    public Team getTeam() {
        return team;
    }

    public String getStatus() {
        return status;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
