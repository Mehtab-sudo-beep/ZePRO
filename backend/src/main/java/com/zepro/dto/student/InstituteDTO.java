package com.zepro.dto.student;

public class InstituteDTO {
    
    private Long instituteId;
    private String instituteName;
    private String instituteCode;

    public InstituteDTO(Long instituteId, String instituteName, String instituteCode) {
        this.instituteId = instituteId;
        this.instituteName = instituteName;
        this.instituteCode = instituteCode;
    }

    public Long getInstituteId() { return instituteId; }
    public String getInstituteName() { return instituteName; }
    public String getInstituteCode() { return instituteCode; }
}