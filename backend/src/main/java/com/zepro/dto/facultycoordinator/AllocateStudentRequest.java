// ─────────────────────────────────────────────────────────────────────────────
// FILE: AllocateStudentRequest.java
// Triggered by: "Allocate Faculty" modal → handleAllocateStudent()
// ─────────────────────────────────────────────────────────────────────────────
package com.zepro.dto.facultycoordinator;

public class AllocateStudentRequest {

    private Long studentId;   // Student.studentId — the unallocated student
    private Long facultyId;   // Faculty.facultyId — target faculty with open slots

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
}