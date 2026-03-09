package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adminId;

    @OneToOne
    @JoinColumn(name = "user_id")
    private Users user;

    // ---------- getters ----------

    public Long getAdminId() {
        return adminId;
    }

    public Users getUser() {
        return user;
    }

    // ---------- setters ----------

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public void setUser(Users user) {
        this.user = user;
    }
}