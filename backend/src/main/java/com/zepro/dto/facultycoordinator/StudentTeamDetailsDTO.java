package com.zepro.dto.facultycoordinator;

import java.util.List;

public class StudentTeamDetailsDTO {
    private List<CoordinatorTeamDetailDTO> teamsInDepartment;
    private List<CoordinatorStudentResponse> unallocatedStudents;

    public StudentTeamDetailsDTO(List<CoordinatorTeamDetailDTO> teamsInDepartment,
            List<CoordinatorStudentResponse> unallocatedStudents) {
        this.teamsInDepartment = teamsInDepartment;
        this.unallocatedStudents = unallocatedStudents;
    }

    public List<CoordinatorTeamDetailDTO> getTeamsInDepartment() { return teamsInDepartment; }
    public void setTeamsInDepartment(List<CoordinatorTeamDetailDTO> teamsInDepartment) {
        this.teamsInDepartment = teamsInDepartment;
    }

    public List<CoordinatorStudentResponse> getUnallocatedStudents() { return unallocatedStudents; }
    public void setUnallocatedStudents(List<CoordinatorStudentResponse> unallocatedStudents) {
        this.unallocatedStudents = unallocatedStudents;
    }
}