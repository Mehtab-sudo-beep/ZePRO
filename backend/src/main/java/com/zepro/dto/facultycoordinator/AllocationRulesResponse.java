package com.zepro.dto.facultycoordinator;

public class AllocationRulesResponse {
      private int maxTeamSize;
    private int maxStudentsPerFaculty;
 
    public AllocationRulesResponse() {}
 
    public AllocationRulesResponse(int maxTeamSize, int maxStudentsPerFaculty) {
        this.maxTeamSize           = maxTeamSize;
        this.maxStudentsPerFaculty = maxStudentsPerFaculty;
    }
 
    public int getMaxTeamSize()           { return maxTeamSize; }
    public int getMaxStudentsPerFaculty() { return maxStudentsPerFaculty; }
 
    public void setMaxTeamSize(int v)           { this.maxTeamSize = v; }
    public void setMaxStudentsPerFaculty(int v) { this.maxStudentsPerFaculty = v; }
    
}
