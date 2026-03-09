package com.zepro.model;
import jakarta.persistence.*;
import java.util.List;
@Entity
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    private String teamName;

    @OneToOne
    private Student teamLead;

    @OneToMany(mappedBy = "team")
    private List<TeamMember> members;
    @OneToOne
    private Project assignedProject;
}
