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

    private String designation;
private String employeeId;
private String specialization;
private String experience;
private String qualification;
private String cabinNo;
private String institute;
private String phone;
private String problemStatementLink;
private String domains;
private String subDomains;

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

    // ================= NEW GETTERS =================

public String getPhone() { return phone; }

public String getDesignation() { return designation; }

public String getEmployeeId() { return employeeId; }

public String getSpecialization() { return specialization; }

public String getExperience() { return experience; }

public String getQualification() { return qualification; }

public String getCabinNo() { return cabinNo; }

public String getInstitute() { return institute; }

public String getProblemStatementLink() { return problemStatementLink; }

public String getDomains() { return domains; }

public String getSubDomains() { return subDomains; }

// ================= NEW SETTERS =================

public void setPhone(String phone) { this.phone = phone; }

public void setDesignation(String designation) { this.designation = designation; }

public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

public void setSpecialization(String specialization) { this.specialization = specialization; }

public void setExperience(String experience) { this.experience = experience; }

public void setQualification(String qualification) { this.qualification = qualification; }

public void setCabinNo(String cabinNo) { this.cabinNo = cabinNo; }

public void setInstitute(String institute) { this.institute = institute; }

public void setProblemStatementLink(String problemStatementLink) { this.problemStatementLink = problemStatementLink; }

public void setDomains(String domains) { this.domains = domains; }

public void setSubDomains(String subDomains) { this.subDomains = subDomains; }
}