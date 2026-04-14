package com.zepro.dto.faculty;

import com.zepro.model.Institute;

public class FacultyProfile {

    private Long facultyId;           // ✅ ADD THIS
    private String name;
    private String email;
    private String phone;

    private Long departmentId;        // ✅ ADD THIS
    private String department;
    private Long instituteId;         // ✅ ADD THIS
    private String designation;
    private String employeeId;
    private String specialization;
    private String experience;
    private String qualification;
    private String cabinNo;
    private Institute institute;

    private String problemStatementLink;
    private String domains;
    private String subDomains;
    private int totalCreatedSlots;
    private int allocatedStudents;
    private int maxStudentsPerFaculty;

    // ========== CONSTRUCTORS ==========
    public FacultyProfile() {}

    // ========== GETTERS AND SETTERS ==========

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Long getDepartmentId() { return departmentId; }  // ✅ ADD THIS
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Long getInstituteId() { return instituteId; }  // ✅ ADD THIS
    public void setInstituteId(Long instituteId) { this.instituteId = instituteId; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getCabinNo() { return cabinNo; }
    public void setCabinNo(String cabinNo) { this.cabinNo = cabinNo; }

    public Institute getInstitute() { return institute; }
    public void setInstitute(Institute institute) { this.institute = institute; }

    public String getProblemStatementLink() { return problemStatementLink; }
    public void setProblemStatementLink(String problemStatementLink) { this.problemStatementLink = problemStatementLink; }

    public String getDomains() { return domains; }
    public void setDomains(String domains) { this.domains = domains; }

    public String getSubDomains() { return subDomains; }
    public void setSubDomains(String subDomains) { this.subDomains = subDomains; }

    public int getTotalCreatedSlots() { return totalCreatedSlots; }
    public void setTotalCreatedSlots(int totalCreatedSlots) { this.totalCreatedSlots = totalCreatedSlots; }

    public int getAllocatedStudents() { return allocatedStudents; }
    public void setAllocatedStudents(int allocatedStudents) { this.allocatedStudents = allocatedStudents; }

    public int getMaxStudentsPerFaculty() { return maxStudentsPerFaculty; }
    public void setMaxStudentsPerFaculty(int maxStudentsPerFaculty) { this.maxStudentsPerFaculty = maxStudentsPerFaculty; }
}