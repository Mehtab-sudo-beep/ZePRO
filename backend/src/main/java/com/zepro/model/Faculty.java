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

    private Boolean isFC;

    @ManyToOne
    private Department department;

    private String designation;
    private String employeeId;
    private String specialization;
    private String experience;
    private String qualification;
    private String cabinNo;
    private String phone;


    private int allocatedStudents = 0;
    private int maxStudents = 10;

    @OneToMany(mappedBy = "faculty")
    private List<Project> projects;
    @ManyToOne
    @JoinColumn(name = "institute_id")
    private Institute institute;
    

    // ----------- GETTERS -----------

    public Long getFacultyId() { return facultyId; }
    public Users getUser() { return user; }
    public Boolean getIsFC() { return isFC; }
    public Department getDepartment() { return department; }
    public List<Project> getProjects() { return projects; }
    public String getDesignation() { return designation; }
    public String getEmployeeId() { return employeeId; }
    public String getSpecialization() { return specialization; }
    public String getExperience() { return experience; }
    public String getQualification() { return qualification; }
    public String getCabinNo() { return cabinNo; }
    public Institute getInstitute() {
        return institute;
    }
    public String getPhone() { return phone; }

    public int getAllocatedStudents() { return allocatedStudents; }
    public int getMaxStudents() { return maxStudents; }

    // ----------- SETTERS -----------

    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
    public void setUser(Users user) { this.user = user; }
    public void setIsFC(Boolean isFC) { this.isFC = isFC; }
    public void setDepartment(Department department) { this.department = department; }
    public void setProjects(List<Project> projects) { this.projects = projects; }
    public void setDesignation(String designation) { this.designation = designation; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }
    public void setExperience(String experience) { this.experience = experience; }
    public void setQualification(String qualification) { this.qualification = qualification; }
    public void setCabinNo(String cabinNo) { this.cabinNo = cabinNo; }
    public void setInstitute(Institute institute) { this.institute = institute; }
    public void setPhone(String phone) { this.phone = phone; }

    public void setAllocatedStudents(int allocatedStudents) { this.allocatedStudents = allocatedStudents; }
    public void setMaxStudents(int maxStudents) { this.maxStudents = maxStudents; }
}