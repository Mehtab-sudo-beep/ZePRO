package com.zepro.dto.student;

public class DepartmentDTO {
    
    private Long departmentId;
    private String departmentName;
    private String departmentCode;

    public DepartmentDTO(Long departmentId, String departmentName, String departmentCode) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
    }

    public Long getDepartmentId() { return departmentId; }
    public String getDepartmentName() { return departmentName; }
    public String getDepartmentCode() { return departmentCode; }
}