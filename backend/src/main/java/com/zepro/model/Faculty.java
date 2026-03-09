package com.zepro.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long facultyId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

    private Boolean isCoordinator;

    @ManyToOne
    private Department department;

    // faculty can create many projects
    @OneToMany(mappedBy = "faculty")
    private List<Project> projects;

    // getters
    public Long getFacultyId() { return facultyId; }
    public Users getUser() { return user; }
    public Boolean getIsCoordinator() { return isCoordinator; }
    public Department getDepartment() { return department; }
    public List<Project> getProjects() { return projects; }

    // setters
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
    public void setUser(Users user) { this.user = user; }
    public void setIsCoordinator(Boolean isCoordinator) { this.isCoordinator = isCoordinator; }
    public void setDepartment(Department department) { this.department = department; }
    public void setProjects(List<Project> projects) { this.projects = projects; }
}