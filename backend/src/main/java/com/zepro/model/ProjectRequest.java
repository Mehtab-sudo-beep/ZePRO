package com.zepro.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class ProjectRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    @ManyToOne
    private Faculty faculty;

    @ManyToOne
    private Team team;

    @ManyToOne
    private Project project;

    @Column(length = 500)
    private String rejectionReason;

    // ✅ NEW: Individual team member details (JSON stored as string)
    @Column(columnDefinition = "LONGTEXT")
    private String teamMembersNames;

    @Column(columnDefinition = "LONGTEXT")
    private String teamMembersRollNumbers;

    @Column(columnDefinition = "LONGTEXT")
    private String teamMembersCgpas;

    @Column(columnDefinition = "LONGTEXT")
    private String teamMembersResumeLinks;

    @Column(columnDefinition = "LONGTEXT")
    private String teamMembersMakeSheetLinks;
    

    // Getters and Setters
    public Long getRequestId() {
        return requestId;
    }

    public void setRequestId(Long requestId) {
        this.requestId = requestId;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public Faculty getFaculty() {
        return faculty;
    }

    public void setFaculty(Faculty faculty) {
        this.faculty = faculty;
    }

    public Team getTeam() {
        return team;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    // ✅ NEW: Individual team member details getters and setters
    public String getTeamMembersNames() {
        return teamMembersNames;
    }

    public void setTeamMembersNames(String teamMembersNames) {
        this.teamMembersNames = teamMembersNames;
    }

    public String getTeamMembersRollNumbers() {
        return teamMembersRollNumbers;
    }

    public void setTeamMembersRollNumbers(String teamMembersRollNumbers) {
        this.teamMembersRollNumbers = teamMembersRollNumbers;
    }

    public String getTeamMembersCgpas() {
        return teamMembersCgpas;
    }

    public void setTeamMembersCgpas(String teamMembersCgpas) {
        this.teamMembersCgpas = teamMembersCgpas;
    }

    public String getTeamMembersResumeLinks() {
        return teamMembersResumeLinks;
    }

    public void setTeamMembersResumeLinks(String teamMembersResumeLinks) {
        this.teamMembersResumeLinks = teamMembersResumeLinks;
    }

    public String getTeamMembersMakeSheetLinks() {
        return teamMembersMakeSheetLinks;
    }

    public void setTeamMembersMakeSheetLinks(String teamMembersMakeSheetLinks) {
        this.teamMembersMakeSheetLinks = teamMembersMakeSheetLinks;
    }
}