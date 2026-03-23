package com.zepro.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    private String teamName;
    private String description;

    @OneToOne
    private Student teamLead;

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL)
private List<Student> members;

    public Long getTeamId() {
        return teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public String getDescription() {
        return description;
    }

    public Student getTeamLead() {
        return teamLead;
    }

    public List<Student> getMembers() {
        return members;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTeamLead(Student teamLead) {
        this.teamLead = teamLead;
    }

    public void setMembers(List<Student> members) {
        this.members = members;
    }
}