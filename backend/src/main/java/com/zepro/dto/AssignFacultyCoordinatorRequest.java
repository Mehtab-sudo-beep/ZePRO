package com.zepro.dto;

public class AssignFacultyCoordinatorRequest {
    private Long facultyId;
    private Long departmentId;
    private String degree; // "UG", "PG", or "BOTH"

    public AssignFacultyCoordinatorRequest() {}

    public AssignFacultyCoordinatorRequest(Long facultyId, Long departmentId, String degree) {
        this.facultyId = facultyId;
        this.departmentId = departmentId;
        this.degree = degree;
    }

    public String getDegree() { return degree; }
    public void setDegree(String degree) { this.degree = degree; }

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