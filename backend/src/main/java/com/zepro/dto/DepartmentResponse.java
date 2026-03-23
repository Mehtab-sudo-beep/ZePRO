package com.zepro.dto;

public class DepartmentResponse {

    private Long departmentId;
    private String departmentName;
    private Long instituteId;
    private String instituteName;

    private String departmentCode;
    private String description;
    private String coordinatorName;
    private String coordinatorEmail;
    private String coordinatorPhone;

    public DepartmentResponse(Long departmentId, String departmentName,
                              Long instituteId, String instituteName,
                              String departmentCode, String description,
                              String coordinatorName, String coordinatorEmail,
                              String coordinatorPhone) {

        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.instituteId = instituteId;
        this.instituteName = instituteName;
        this.departmentCode = departmentCode;
        this.description = description;
        this.coordinatorName = coordinatorName;
        this.coordinatorEmail = coordinatorEmail;
        this.coordinatorPhone = coordinatorPhone;
    }

    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
    public Long getInstituteId() { return instituteId; }
    public String getInstituteName() { return instituteName; }

    public String getDepartmentCode() { return departmentCode; }
    public String getDescription() { return description; }
    public String getCoordinatorName() { return coordinatorName; }
    public String getCoordinatorEmail() { return coordinatorEmail; }
    public String getCoordinatorPhone() { return coordinatorPhone; }
}