package com.zepro.dto.faculty;

public class CompleteFacultyProfileRequest {
    private String employeeId;
    private String designation;
    private String specialization;
    private String experience;
    private String qualification;
    private String cabinNo;
    private String phone;
    private String problemStatementLink;
    private String domains;
    private String subDomains;
    private Long departmentId;
    private Long instituteId;

    // Constructors
    public CompleteFacultyProfileRequest() {}

    // Getters & Setters
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getCabinNo() { return cabinNo; }
    public void setCabinNo(String cabinNo) { this.cabinNo = cabinNo; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getProblemStatementLink() { return problemStatementLink; }
    public void setProblemStatementLink(String problemStatementLink) { this.problemStatementLink = problemStatementLink; }

    public String getDomains() { return domains; }
    public void setDomains(String domains) { this.domains = domains; }

    public String getSubDomains() { return subDomains; }
    public void setSubDomains(String subDomains) { this.subDomains = subDomains; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public Long getInstituteId() { return instituteId; }
    public void setInstituteId(Long instituteId) { this.instituteId = instituteId; }
}