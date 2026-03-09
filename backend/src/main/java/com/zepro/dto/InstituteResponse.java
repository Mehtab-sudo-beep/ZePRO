package com.zepro.dto;

public class InstituteResponse {

    private Long instituteId;
    private String instituteName;

    public InstituteResponse(Long instituteId, String instituteName) {
        this.instituteId = instituteId;
        this.instituteName = instituteName;
    }

    public Long getInstituteId() {
        return instituteId;
    }

    public String getInstituteName() {
        return instituteName;
    }
}