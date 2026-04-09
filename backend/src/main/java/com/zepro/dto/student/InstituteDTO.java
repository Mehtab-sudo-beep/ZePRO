package com.zepro.dto.student;

public class InstituteDTO {
    private Long instituteId;
    private String instituteName;
    private String instituteCode;

    // ✅ ADD DEFAULT CONSTRUCTOR
    public InstituteDTO() {}

    // ✅ ADD PARAMETERIZED CONSTRUCTOR
    public InstituteDTO(Long instituteId, String instituteName, String instituteCode) {
        this.instituteId = instituteId;
        this.instituteName = instituteName;
        this.instituteCode = instituteCode;
    }

    // Getters & Setters
    public Long getInstituteId() { return instituteId; }
    public void setInstituteId(Long instituteId) { this.instituteId = instituteId; }

    public String getInstituteName() { return instituteName; }
    public void setInstituteName(String instituteName) { this.instituteName = instituteName; }

    public String getInstituteCode() { return instituteCode; }
    public void setInstituteCode(String instituteCode) { this.instituteCode = instituteCode; }
}