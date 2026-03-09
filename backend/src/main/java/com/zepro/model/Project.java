package com.zepro.model;
import jakarta.persistence.*;
@Entity
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long projectId;

    private String title;
    private String description;

    @ManyToOne
    private Faculty faculty;

    @ManyToOne
    private Team assignedTeam;
}
