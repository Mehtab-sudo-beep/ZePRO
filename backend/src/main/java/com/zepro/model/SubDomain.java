package com.zepro.model;
import jakarta.persistence.*;
@Entity
public class SubDomain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subDomainId;

    private String name;

    @ManyToOne
    private Domain domain;
}
