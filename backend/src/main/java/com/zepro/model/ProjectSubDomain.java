package com.zepro.model;
import jakarta.persistence.*;
@Entity
public class ProjectSubDomain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Project project;

    @ManyToOne
    private SubDomain subDomain;
}