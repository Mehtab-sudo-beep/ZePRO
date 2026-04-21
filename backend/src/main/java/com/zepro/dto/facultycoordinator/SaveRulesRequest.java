package com.zepro.dto.facultycoordinator;

public class SaveRulesRequest {
    private Long departmentId;      // ✅ ADD THIS
    private int maxTeamSize;
    private int maxStudentsPerFaculty;
    private int maxProjectsPerFaculty;
    private String degree;

    // Constructors
    public SaveRulesRequest() {}

    public SaveRulesRequest(Long departmentId, int maxTeamSize, int maxStudentsPerFaculty, int maxProjectsPerFaculty, String degree) {
        this.departmentId = departmentId;
        this.maxTeamSize = maxTeamSize;
        this.maxStudentsPerFaculty = maxStudentsPerFaculty;
        this.maxProjectsPerFaculty = maxProjectsPerFaculty;
        this.degree = degree;
    }

    // Getters & Setters
    public Long getDepartmentId() { 
        return departmentId; 
    }
    public void setDepartmentId(Long departmentId) { 
        this.departmentId = departmentId; 
    }

    public int getMaxTeamSize() { 
        return maxTeamSize; 
    }
    public void setMaxTeamSize(int maxTeamSize) { 
        this.maxTeamSize = maxTeamSize; 
    }

    public int getMaxStudentsPerFaculty() { 
        return maxStudentsPerFaculty; 
    }
    public void setMaxStudentsPerFaculty(int maxStudentsPerFaculty) { 
        this.maxStudentsPerFaculty = maxStudentsPerFaculty; 
    }

    public int getMaxProjectsPerFaculty() { 
        return maxProjectsPerFaculty; 
    }
    public void setMaxProjectsPerFaculty(int maxProjectsPerFaculty) { 
        this.maxProjectsPerFaculty = maxProjectsPerFaculty; 
    }

    public String getDegree() {
        return degree;
    }
    public void setDegree(String degree) {
        this.degree = degree;
    }
}