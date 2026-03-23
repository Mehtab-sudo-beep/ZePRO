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

    private int allocatedStudents = 0;   // ← add

    private int maxStudents = 10;        // ← add (default 10)

    private String specialization;       // ← add

    @OneToMany(mappedBy = "faculty")
    private List<Project> projects;

    // getters
    public Long getFacultyId()           { return facultyId; }
    public Users getUser()               { return user; }
    public Boolean getIsCoordinator()    { return isCoordinator; }
    public Department getDepartment()    { return department; }
    public List<Project> getProjects()   { return projects; }
    public int getAllocatedStudents()     { return allocatedStudents; }
    public int getMaxStudents()          { return maxStudents; }
    public String getSpecialization()    { return specialization; }

    // setters
    public void setFacultyId(Long facultyId)             { this.facultyId = facultyId; }
    public void setUser(Users user)                      { this.user = user; }
    public void setIsCoordinator(Boolean isCoordinator)  { this.isCoordinator = isCoordinator; }
    public void setDepartment(Department department)     { this.department = department; }
    public void setProjects(List<Project> projects)      { this.projects = projects; }
    public void setAllocatedStudents(int v)              { this.allocatedStudents = v; }
    public void setMaxStudents(int v)                    { this.maxStudents = v; }
    public void setSpecialization(String v)              { this.specialization = v; }
}