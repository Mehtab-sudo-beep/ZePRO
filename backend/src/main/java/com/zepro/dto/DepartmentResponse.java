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

    private String ugCoordinatorName;
    private String ugCoordinatorEmail;
    private String ugCoordinatorPhone;

    private String pgCoordinatorName;
    private String pgCoordinatorEmail;
    private String pgCoordinatorPhone;

    // ✅ CONSTRUCTOR
    public DepartmentResponse(Long departmentId, String departmentName, Long instituteId, String instituteName,
                              String departmentCode, String description, String coordinatorName,
                              String coordinatorEmail, String coordinatorPhone,
                              String ugCoordinatorName, String ugCoordinatorEmail, String ugCoordinatorPhone,
                              String pgCoordinatorName, String pgCoordinatorEmail, String pgCoordinatorPhone) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.instituteId = instituteId;
        this.instituteName = instituteName;
        this.departmentCode = departmentCode;
        this.description = description;
        this.coordinatorName = coordinatorName;
        this.coordinatorEmail = coordinatorEmail;
        this.coordinatorPhone = coordinatorPhone;
        this.ugCoordinatorName = ugCoordinatorName;
        this.ugCoordinatorEmail = ugCoordinatorEmail;
        this.ugCoordinatorPhone = ugCoordinatorPhone;
        this.pgCoordinatorName = pgCoordinatorName;
        this.pgCoordinatorEmail = pgCoordinatorEmail;
        this.pgCoordinatorPhone = pgCoordinatorPhone;
    }

    // ✅ DEFAULT CONSTRUCTOR
    public DepartmentResponse() {}

    // ✅ GETTERS AND SETTERS
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public Long getInstituteId() { return instituteId; }
    public void setInstituteId(Long instituteId) { this.instituteId = instituteId; }

    public String getInstituteName() { return instituteName; }
    public void setInstituteName(String instituteName) { this.instituteName = instituteName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCoordinatorName() { return coordinatorName; }
    public void setCoordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; }

    public String getCoordinatorEmail() { return coordinatorEmail; }
    public void setCoordinatorEmail(String coordinatorEmail) { this.coordinatorEmail = coordinatorEmail; }

    public String getCoordinatorPhone() { return coordinatorPhone; }
    public void setCoordinatorPhone(String coordinatorPhone) { this.coordinatorPhone = coordinatorPhone; }

    public String getUgCoordinatorName() { return ugCoordinatorName; }
    public void setUgCoordinatorName(String ugCoordinatorName) { this.ugCoordinatorName = ugCoordinatorName; }

    public String getUgCoordinatorEmail() { return ugCoordinatorEmail; }
    public void setUgCoordinatorEmail(String ugCoordinatorEmail) { this.ugCoordinatorEmail = ugCoordinatorEmail; }

    public String getUgCoordinatorPhone() { return ugCoordinatorPhone; }
    public void setUgCoordinatorPhone(String ugCoordinatorPhone) { this.ugCoordinatorPhone = ugCoordinatorPhone; }

    public String getPgCoordinatorName() { return pgCoordinatorName; }
    public void setPgCoordinatorName(String pgCoordinatorName) { this.pgCoordinatorName = pgCoordinatorName; }

    public String getPgCoordinatorEmail() { return pgCoordinatorEmail; }
    public void setPgCoordinatorEmail(String pgCoordinatorEmail) { this.pgCoordinatorEmail = pgCoordinatorEmail; }

    public String getPgCoordinatorPhone() { return pgCoordinatorPhone; }
    public void setPgCoordinatorPhone(String pgCoordinatorPhone) { this.pgCoordinatorPhone = pgCoordinatorPhone; }
}