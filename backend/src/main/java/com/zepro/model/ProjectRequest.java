package com.zepro.model;
import jakarta.persistence.*;
@Entity
public class ProjectRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne
    private Team team;

    @ManyToOne
    private Faculty faculty;

    private String status;
}
