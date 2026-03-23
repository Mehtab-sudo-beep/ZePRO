package com.zepro.dto.facultycoordinator;

public class SaveRulesRequest {

    private int maxTeamSize;            // Max members per team
    private int maxStudentsPerFaculty;  // Max students a faculty can guide

    public int getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(int maxTeamSize) { this.maxTeamSize = maxTeamSize; }

    public int getMaxStudentsPerFaculty() { return maxStudentsPerFaculty; }
    public void setMaxStudentsPerFaculty(int maxStudentsPerFaculty) {
        this.maxStudentsPerFaculty = maxStudentsPerFaculty;
    }
}