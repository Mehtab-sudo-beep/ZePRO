package com.zepro.model;
import jakarta.persistence.*;
@Entity
public class Domain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long domainId;

    private String name;

    @ManyToOne
    private Faculty faculty;
}
