package com.zepro.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    private String teamName;
    private String description;

    private String status = "pending";
    
    private String degree; // UG or PG

    @OneToOne
    private Student teamLead;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @ManyToOne
    @JoinColumn(name = "institute_id")
    private Institute institute;

    @OneToMany(mappedBy = "team", cascade = {CascadeType.PERSIST, CascadeType.MERGE, CascadeType.REFRESH, CascadeType.DETACH})
    private List<Student> members;

    // ----------- GETTERS -----------

    public Long getTeamId() {
        return teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public String getDescription() {
        return description;
    }

    public String getStatus() {
        return status;
    }

    public Student getTeamLead() {
        return teamLead;
    }

    public Faculty getFaculty() {
        return faculty;
    }

    public List<Student> getMembers() {
        return members;
    }

    public Department getDepartment() {
        return department;
    }

    public Institute getInstitute() {
        return institute;
    }

    // ----------- SETTERS -----------

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setTeamLead(Student teamLead) {
        this.teamLead = teamLead;
    }

    public void setFaculty(Faculty faculty) {
        this.faculty = faculty;
    }

    public void setMembers(List<Student> members) {
        this.members = members;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }

    public void setInstitute(Institute institute) {
        this.institute = institute;
    }

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }
}