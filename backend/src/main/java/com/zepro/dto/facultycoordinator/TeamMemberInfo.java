package com.zepro.dto.facultycoordinator;

public class TeamMemberInfo {
    private String name;               // Student.user.name
    private String rollNo;             // Student.rollNo
    private String email;              // Student.user.email
    private String cgpa;               // Student.cgpa
    private boolean isTeamLead;        // true if this member is the team leader
    private String allocatedFacultyName; // Faculty allocated to this student (may differ from team faculty)

    public TeamMemberInfo() {}

    public TeamMemberInfo(String name, String rollNo, String email, String cgpa,
                          boolean isTeamLead, String allocatedFacultyName) {
        this.name                 = name;
        this.rollNo               = rollNo;
        this.email                = email;
        this.cgpa                 = cgpa;
        this.isTeamLead           = isTeamLead;
        this.allocatedFacultyName = allocatedFacultyName;
    }

    public String getName()                 { return name; }
    public String getRollNo()               { return rollNo; }
    public String getEmail()                { return email; }
    public String getCgpa()                 { return cgpa; }
    public boolean isTeamLead()             { return isTeamLead; }
    public String getAllocatedFacultyName()  { return allocatedFacultyName; }

    public void setName(String v)                   { this.name = v; }
    public void setRollNo(String v)                 { this.rollNo = v; }
    public void setEmail(String v)                  { this.email = v; }
    public void setCgpa(String v)                   { this.cgpa = v; }
    public void setTeamLead(boolean v)              { this.isTeamLead = v; }
    public void setAllocatedFacultyName(String v)   { this.allocatedFacultyName = v; }
}
