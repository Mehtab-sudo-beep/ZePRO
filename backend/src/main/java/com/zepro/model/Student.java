package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    // Link to base user table
    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

    // Student specific flags
    private boolean isInTeam = false;

    private boolean isTeamLead = false;

    // Team relation
    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;


    @ManyToOne
private Department department;
    // ----------- GETTERS -----------

    public Long getStudentId() {
        return studentId;
    }

    public String getName(){
        return user.getName();
    }

    public Users getUser() {
        return user;
    }

    public boolean isInTeam() {
        return isInTeam;
    }

    public boolean isTeamLead() {
        return isTeamLead;
    }

    public Team getTeam() {
        return team;
    }

    // ----------- SETTERS -----------

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public void setUser(Users user) {
        this.user = user;
    }

    public void setInTeam(boolean inTeam) {
        this.isInTeam = inTeam;
    }

    public void setTeamLead(boolean teamLead) {
        this.isTeamLead = teamLead;
    }

    public void setTeam(Team team) {
        this.team = team;
    }
}