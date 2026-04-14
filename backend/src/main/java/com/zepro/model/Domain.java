package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class Domain {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long domainId;

    private String name;

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Faculty faculty;

    @ManyToOne
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Department department;

    // getters

    public Long getDomainId() {
        return domainId;
    }

    public String getName() {
        return name;
    }

    public Faculty getFaculty() {
        return faculty;
    }

    // setters

    public void setDomainId(Long domainId) {
        this.domainId = domainId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setFaculty(Faculty faculty) {
        this.faculty = faculty;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }
}
