package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long studentId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

    private Boolean isInTeam;

    private Boolean isTeamLead;

    @ManyToOne
    private Department department;

    @ManyToOne
    private Team team;
}