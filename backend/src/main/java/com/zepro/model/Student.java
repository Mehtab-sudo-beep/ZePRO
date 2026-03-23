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
    @Column(name = "roll_no", unique = true, nullable = true)
    private String rollNo;

    // Mirrors Student.cgpa — shown in student cards + report
    @Column(name = "cgpa")
    private String cgpa;

    // Mirrors Student.year — e.g. "3rd Year"
    @Column(name = "year")
    private String year;

    // Mirrors Student.isAllocated — drives Allocated/Unallocated badge
    
    @Column(name = "is_allocated")
    private boolean isAllocated = false;

    @ManyToOne
    @JoinColumn(name = "allocated_faculty_id")
    private Faculty allocatedFaculty;
    
    private boolean isInTeam = false;

    private boolean isTeamLead = false;

    // Team relation
    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    @ManyToOne
    private Department department;
    // ----------- GETTERS -----------

    public Long getStudentId() {
        return studentId;
    }

    public String getName() {
        return user.getName();
    }

    public Users getUser() {
        return user;
    }

    public boolean isInTeam() {
        return isInTeam;
    }

    public String getRollNo() {
        return rollNo;
    }

    public String getCgpa() {
        return cgpa;
    }

    public String getYear() {
        return year;
    }

    public boolean isAllocated() {
        return isAllocated;
    }

    public Faculty getAllocatedFaculty() {
        return allocatedFaculty;
    }

    public Department getDepartment() {
        return department;
    }

    public boolean isTeamLead() {
        return isTeamLead;
    }

    public Team getTeam() {
        return team;
    }

    // ----------- SETTERS -----------
    public void setRollNo(String rollNo) {
        this.rollNo = rollNo;
    }

    public void setCgpa(String cgpa) {
        this.cgpa = cgpa;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public void setInTeam(boolean inTeam) {
        this.isInTeam = inTeam;
    }

    public void setAllocated(boolean allocated) {
        this.isAllocated = allocated;
    }

    public void setAllocatedFaculty(Faculty faculty) {
        this.allocatedFaculty = faculty;
    }

    public void setTeamLead(boolean teamLead) {
        this.isTeamLead = teamLead;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }
}