package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    // Link to base user table
    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

    @Column(name = "roll_no", unique = true)
    private String rollNumber;

    // Mirrors Student.cgpa — shown in student cards + report
    @Column(name = "cgpa")
    private double cgpa;

    // Mirrors Student.degree — e.g. "UG" or "PG"
    @Column(name = "degree")
    private String degree;

    // Mirrors Student.isAllocated — drives Allocated/Unallocated badge
    
    @Column(name = "is_allocated")
    private boolean isAllocated = false;

    @ManyToOne
    @JoinColumn(name = "allocated_faculty_id")
    private Faculty allocatedFaculty;

    @ManyToOne
    @JoinColumn(name = "allocated_project_id")
    private Project allocatedProject;
    
    private boolean isInTeam = false;

    private boolean isTeamLead = false;

    // Team relation
    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    // ✅ ADD INSTITUTE RELATION
    @ManyToOne
    @JoinColumn(name = "institute_id")
    private Institute institute;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    private String resumeLink;

    private String marksheetLink;

    // ----------- GETTERS -----------

    public Long getStudentId() {
        return studentId;
    }

    public Users getUser() {
        return user;
    }

    public String getName() {
        return (user != null) ? user.getName() : null;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public double getCgpa() {
        return cgpa;
    }

    public String getDegree() {
        return degree;
    }

    public boolean isAllocated() {
        return isAllocated;
    }

    public boolean isInTeam() {
        return isInTeam;
    }

    public boolean isTeamLead() {
        return isTeamLead;
    }

    public Team getTeam() {
        return team;
    }

    // ✅ ADD INSTITUTE GETTER
    public Institute getInstitute() {
        return institute;
    }

    public Department getDepartment() {
        return department;
    }

    public Faculty getAllocatedFaculty() {
        return allocatedFaculty;
    }

    public Project getAllocatedProject() {
        return allocatedProject;
    }

    public String getResumeLink() {
        return resumeLink;
    }

    public String getMarksheetLink() {
        return marksheetLink;
    }

    // ----------- SETTERS -----------

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public void setCgpa(double cgpa) {
        this.cgpa = cgpa;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }

    public void setAllocated(boolean allocated) {
        this.isAllocated = allocated;
    }

    public void setInTeam(boolean inTeam) {
        this.isInTeam = inTeam;
    }

    public void setTeamLead(boolean teamLead) {
        this.isTeamLead = teamLead;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    // ✅ ADD INSTITUTE SETTER
    public void setInstitute(Institute institute) {
        this.institute = institute;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public void setAllocatedFaculty(Faculty faculty) {
        this.allocatedFaculty = faculty;
    }

    public void setAllocatedProject(Project allocatedProject) {
        this.allocatedProject = allocatedProject;
    }

    public void setResumeLink(String resumeLink) {
        this.resumeLink = resumeLink;
    }

    public void setMarksheetLink(String marksheetLink) {
        this.marksheetLink = marksheetLink;
    }
}