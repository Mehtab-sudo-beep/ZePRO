package com.zepro.model;

import jakarta.persistence.*;

@Entity
@Table(
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"student_id", "team_id"}
    )
)
public class TeamJoinRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long requestId;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne
    @JoinColumn(name = "team_id")
    private Team team;

    private String status;
 // PENDING, APPROVED, REJECTED

    public Long getRequestId() {
        return requestId;
    }

    public Student getStudent() {
        return student;
    }

    public Team getTeam() {
        return team;
    }

    public String getStatus() {
        return status;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public void setTeam(Team team) {
        this.team = team;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}