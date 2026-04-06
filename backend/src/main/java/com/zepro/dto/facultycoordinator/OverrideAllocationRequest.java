// ─────────────────────────────────────────────────────────────────────────────
// FILE: OverrideAllocationRequest.java
// Triggered by: "Override Allocation" modal → handleOverrideAllocation()
// ─────────────────────────────────────────────────────────────────────────────
package com.zepro.dto.facultycoordinator;

public class OverrideAllocationRequest {

    private Long studentId;     // Student already allocated — being reassigned
    private Long newFacultyId;  // Faculty.facultyId — the new target faculty

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getNewFacultyId() { return newFacultyId; }
    public void setNewFacultyId(Long newFacultyId) { this.newFacultyId = newFacultyId; }
}