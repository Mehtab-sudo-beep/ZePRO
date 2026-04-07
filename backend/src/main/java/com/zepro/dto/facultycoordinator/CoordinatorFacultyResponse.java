package com.zepro.dto.facultycoordinator;

public class CoordinatorFacultyResponse {
    private Long   facultyId;
    private String name;            // Faculty.user.name
    private String email;           // Faculty.user.email
    private String department;      // Faculty.department.departmentName
    private int    maxStudents;     // Faculty.maxStudents
    private int    allocatedStudents; // Faculty.allocatedStudents
    private int    totalCreatedSlots; // ✅ Total slots across all projects
    private String specialization;  // Faculty.specialization
 
    public CoordinatorFacultyResponse() {}
 
    public CoordinatorFacultyResponse(Long facultyId, String name, String email,
                                       String department, int maxStudents,
                                       int allocatedStudents, int totalCreatedSlots, String specialization) {
        this.facultyId         = facultyId;
        this.name              = name;
        this.email             = email;
        this.department        = department;
        this.maxStudents       = maxStudents;
        this.allocatedStudents = allocatedStudents;
        this.totalCreatedSlots = totalCreatedSlots;
        this.specialization    = specialization;
    }
 
    public int    getTotalCreatedSlots() { return totalCreatedSlots; }
    public void setTotalCreatedSlots(int v) { this.totalCreatedSlots = v; }
 
    public Long   getFacultyId()         { return facultyId; }
    public String getName()              { return name; }
    public String getEmail()             { return email; }
    public String getDepartment()        { return department; }
    public int    getMaxStudents()       { return maxStudents; }
    public int    getAllocatedStudents()  { return allocatedStudents; }
    public String getSpecialization()    { return specialization; }
 
    public void setFacultyId(Long v)         { this.facultyId = v; }
    public void setName(String v)            { this.name = v; }
    public void setEmail(String v)           { this.email = v; }
    public void setDepartment(String v)      { this.department = v; }
    public void setMaxStudents(int v)        { this.maxStudents = v; }
    public void setAllocatedStudents(int v)  { this.allocatedStudents = v; }
    public void setSpecialization(String v)  { this.specialization = v; }
}