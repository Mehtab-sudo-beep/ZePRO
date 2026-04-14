package com.zepro.dto.faculty;

public class FacultyProfileResponse {
    private Long facultyId;
    private String name;
    private String email;
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
    private String departmentName;
    private Long instituteId;
    private String instituteName;
    private boolean isProfileComplete;

    public FacultyProfileResponse() {}

    public FacultyProfileResponse(
            Long facultyId,
            String name,
            String email,
            String employeeId,
            String designation,
            String specialization,
            String experience,
            String qualification,
            String cabinNo,
            String phone,
            String problemStatementLink,
            String domains,
            String subDomains,
            Long departmentId,
            String departmentName,
            Long instituteId,
            String instituteName,
            boolean isProfileComplete) {
        this.facultyId = facultyId;
        this.name = name;
        this.email = email;
        this.employeeId = employeeId;
        this.designation = designation;
        this.specialization = specialization;
        this.experience = experience;
        this.qualification = qualification;
        this.cabinNo = cabinNo;
        this.phone = phone;
        this.problemStatementLink = problemStatementLink;
        this.domains = domains;
        this.subDomains = subDomains;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.instituteId = instituteId;
        this.instituteName = instituteName;
        this.isProfileComplete = isProfileComplete;
    }

    // Getters & Setters
    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

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

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Long getInstituteId() { return instituteId; }
    public void setInstituteId(Long instituteId) { this.instituteId = instituteId; }

    public String getInstituteName() { return instituteName; }
    public void setInstituteName(String instituteName) { this.instituteName = instituteName; }

    public boolean isProfileComplete() { return isProfileComplete; }
    public void setProfileComplete(boolean profileComplete) { isProfileComplete = profileComplete; }
}