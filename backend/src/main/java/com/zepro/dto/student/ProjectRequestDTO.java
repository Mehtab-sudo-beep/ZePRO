package com.zepro.dto.student;

import java.util.List;

public class ProjectRequestDTO {

    private Long studentId;
    private Long projectId;

    // ✅ NEW: Team member details
    private List<TeamMemberDTO> teamMembers;

    public ProjectRequestDTO() {}

    public ProjectRequestDTO(Long studentId, Long projectId) {
        this.studentId = studentId;
        this.projectId = projectId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    // ✅ NEW: Team members getters and setters
    public List<TeamMemberDTO> getTeamMembers() {
        return teamMembers;
    }

    public void setTeamMembers(List<TeamMemberDTO> teamMembers) {
        this.teamMembers = teamMembers;
    }

    // ✅ INNER CLASS: Team member details
    public static class TeamMemberDTO {
        private String name;
        private String rollNumber;
        private Double cgpa;
        private String resumeLink;
        private String makeSheetLink;

        public TeamMemberDTO() {}

        public TeamMemberDTO(String name, String rollNumber, Double cgpa, String resumeLink, String makeSheetLink) {
            this.name = name;
            this.rollNumber = rollNumber;
            this.cgpa = cgpa;
            this.resumeLink = resumeLink;
            this.makeSheetLink = makeSheetLink;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getRollNumber() {
            return rollNumber;
        }

        public void setRollNumber(String rollNumber) {
            this.rollNumber = rollNumber;
        }

        public Double getCgpa() {
            return cgpa;
        }

        public void setCgpa(Double cgpa) {
            this.cgpa = cgpa;
        }

        public String getResumeLink() {
            return resumeLink;
        }

        public void setResumeLink(String resumeLink) {
            this.resumeLink = resumeLink;
        }

        public String getMakeSheetLink() {
            return makeSheetLink;
        }

        public void setMakeSheetLink(String makeSheetLink) {
            this.makeSheetLink = makeSheetLink;
        }
    }
}