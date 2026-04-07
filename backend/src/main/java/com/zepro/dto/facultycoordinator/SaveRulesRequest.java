package com.zepro.dto.facultycoordinator;

public class SaveRulesRequest {

    private int maxTeamSize;            // Max members per team
    private int maxStudentsPerFaculty;  // Max students a faculty can guide
    private int maxProjectsPerFaculty;  // Max projects a faculty can hold
    private int version;                // Rule version

    public int getMaxTeamSize() { return maxTeamSize; }
    public void setMaxTeamSize(int maxTeamSize) { this.maxTeamSize = maxTeamSize; }

    public int getMaxStudentsPerFaculty() { return maxStudentsPerFaculty; }
    public void setMaxStudentsPerFaculty(int maxStudentsPerFaculty) {
        this.maxStudentsPerFaculty = maxStudentsPerFaculty;
    }

    public int getMaxProjectsPerFaculty() { return maxProjectsPerFaculty; }
    public void setMaxProjectsPerFaculty(int maxProjectsPerFaculty) {
        this.maxProjectsPerFaculty = maxProjectsPerFaculty;
    }

    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
}