package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class Faculty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long facultyId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;


    private Boolean isCoordinator;

    @ManyToOne
    private Department department;
    // ---------- getters ----------

    public Long getFacultyId() {
        return facultyId;
    }

    public Users getUser() {
        return user;
    }

    // ---------- setters ----------

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }

    public void setUser(Users user) {
        this.user = user;
    }
}