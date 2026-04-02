package com.zepro.dto.faculty;

public class FacultyProfile {

    private String name;
    private String email;
    private String phone;

    private String department;
    private String designation;
    private String employeeId;
    private String specialization;
    private String experience;
    private String qualification;
    private String cabinNo;
    private String institute;

    private String problemStatementLink;
    private String domains;
    private String subDomains;

    // getters and setters

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

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

    public String getInstitute() { return institute; }
    public void setInstitute(String institute) { this.institute = institute; }

    public String getProblemStatementLink() { return problemStatementLink; }
    public void setProblemStatementLink(String problemStatementLink) { this.problemStatementLink = problemStatementLink; }

    public String getDomains() { return domains; }
    public void setDomains(String domains) { this.domains = domains; }

    public String getSubDomains() { return subDomains; }
    public void setSubDomains(String subDomains) { this.subDomains = subDomains; }
}