package com.zepro.model;
import jakarta.persistence.*;
@Entity
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Team team;

    @ManyToOne
    private Student student;

    private String role; // LEADER / MEMBER
}
