package com.zepro.dto.facultycoordinator;

public class CoordinatorStudentResponse {
     private Long    studentId;
    private String  name;                // Student.user.name
    private String  rollNo;              // Student.rollNo
    private String  email;               // Student.user.email
    private String  department;          // Student.department.departmentName
    private String  year;                // Student.year
    private String  cgpa;                // Student.cgpa
    private boolean isAllocated;         // Student.isAllocated
    private Long    allocatedFacultyId;  // Student.allocatedFaculty.facultyId (nullable)
    private String  allocatedFacultyName;// Student.allocatedFaculty.user.name (nullable)
    private Long    teamId;              // Student.team.teamId (nullable)
 
    public CoordinatorStudentResponse() {}
 
    public  CoordinatorStudentResponse(Long studentId, String name, String rollNo,
                                       String email, String department, String year,
                                       String cgpa, boolean isAllocated,
                                       Long allocatedFacultyId, String allocatedFacultyName,
                                       Long teamId) {
        this.studentId            = studentId;
        this.name                 = name;
        this.rollNo               = rollNo;
        this.email                = email;
        this.department           = department;
        this.year                 = year;
        this.cgpa                 = cgpa;
        this.isAllocated          = isAllocated;
        this.allocatedFacultyId   = allocatedFacultyId;
        this.allocatedFacultyName = allocatedFacultyName;
        this.teamId               = teamId;
    }
 
    public Long    getStudentId()             { return studentId; }
    public String  getName()                  { return name; }
    public String  getRollNo()                { return rollNo; }
    public String  getEmail()                 { return email; }
    public String  getDepartment()            { return department; }
    public String  getYear()                  { return year; }
    public String  getCgpa()                  { return cgpa; }
    public boolean isAllocated()              { return isAllocated; }
    public Long    getAllocatedFacultyId()     { return allocatedFacultyId; }
    public String  getAllocatedFacultyName()   { return allocatedFacultyName; }
    public Long    getTeamId()                { return teamId; }
 
    public void setStudentId(Long v)              { this.studentId = v; }
    public void setName(String v)                 { this.name = v; }
    public void setRollNo(String v)               { this.rollNo = v; }
    public void setEmail(String v)                { this.email = v; }
    public void setDepartment(String v)           { this.department = v; }
    public void setYear(String v)                 { this.year = v; }
    public void setCgpa(String v)                 { this.cgpa = v; }
    public void setAllocated(boolean v)           { this.isAllocated = v; }
    public void setAllocatedFacultyId(Long v)     { this.allocatedFacultyId = v; }
    public void setAllocatedFacultyName(String v) { this.allocatedFacultyName = v; }
    public void setTeamId(Long v)                 { this.teamId = v; }
}