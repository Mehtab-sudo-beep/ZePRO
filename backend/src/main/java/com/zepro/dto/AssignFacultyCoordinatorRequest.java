package com.zepro.dto;

public class AssignFacultyCoordinatorRequest {
    private Long facultyId;
    private Long departmentId;

    public AssignFacultyCoordinatorRequest() {}

    public AssignFacultyCoordinatorRequest(Long facultyId, Long departmentId) {
        this.facultyId = facultyId;
        this.departmentId = departmentId;
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }
}