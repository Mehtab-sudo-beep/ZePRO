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

    public Long getId() {
        return id;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public SubDomain getSubDomain() {
        return subDomain;
    }

    public void setSubDomain(SubDomain subDomain) {
        this.subDomain = subDomain;
    }
}