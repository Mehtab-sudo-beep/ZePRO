package com.zepro.dto.student;

public class DepartmentDTO {
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long instituteId;

    // ✅ ADD DEFAULT CONSTRUCTOR
    public DepartmentDTO() {}

    // ✅ ADD PARAMETERIZED CONSTRUCTOR
    public DepartmentDTO(Long departmentId, String departmentName, String departmentCode, Long instituteId) {
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.instituteId = instituteId;
    }

    // Getters & Setters
    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public Long getInstituteId() { return instituteId; }
    public void setInstituteId(Long instituteId) { this.instituteId = instituteId; }
}