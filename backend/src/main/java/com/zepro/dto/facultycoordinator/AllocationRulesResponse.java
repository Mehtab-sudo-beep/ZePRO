package com.zepro.dto.facultycoordinator;

public class AllocationRulesResponse {
    private int maxTeamSize;
    private int maxStudentsPerFaculty;
    private int maxProjectsPerFaculty;

    public AllocationRulesResponse() {
    }

    public AllocationRulesResponse(int maxTeamSize, int maxStudentsPerFaculty, int maxProjectsPerFaculty) {
        this.maxTeamSize = maxTeamSize;
        this.maxStudentsPerFaculty = maxStudentsPerFaculty;
        this.maxProjectsPerFaculty = maxProjectsPerFaculty;

    }

    public int getMaxTeamSize() {
        return maxTeamSize;
    }

    public int getMaxStudentsPerFaculty() {
        return maxStudentsPerFaculty;
    }

    public int getMaxProjectsPerFaculty() {
        return maxProjectsPerFaculty;
    }

    public void setMaxTeamSize(int v) {
        this.maxTeamSize = v;
    }

    public void setMaxStudentsPerFaculty(int v) {
        this.maxStudentsPerFaculty = v;
    }

    public void setMaxProjectsPerFaculty(int v) {
        this.maxProjectsPerFaculty = v;
    }

}