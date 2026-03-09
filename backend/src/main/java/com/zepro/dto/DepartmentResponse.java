package com.zepro.dto;

public class DepartmentResponse {

    private Long departmentId;
    private String departmentName;
    private Long instituteId;
    private String instituteName;

    public DepartmentResponse(Long departmentId, String departmentName,
                              Long instituteId, String instituteName) {

        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.instituteId = instituteId;
        this.instituteName = instituteName;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public Long getInstituteId() {
        return instituteId;
    }

    public String getInstituteName() {
        return instituteName;
    }
}