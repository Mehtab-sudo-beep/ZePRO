package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deactivated_team_join_requests")
public class DeactivatedTeamJoinRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deactivationId;

    @ManyToOne
    @JoinColumn(name = "request_id", nullable = false)
    private TeamJoinRequest teamJoinRequest;

    @Column(name = "previous_status")
    private String previousStatus;  // ✅ Status BEFORE deactivation

    @Column(name = "present_status")
    private String presentStatus;   // ✅ Status at deactivation (REJECTED)

    @Column(name = "deactivation_reason")
    private String deactivationReason;

    @Column(name = "deactivation_date")
    private LocalDateTime deactivationDate;

    // ✅ Getters and Setters
    public Long getDeactivationId() {
        return deactivationId;
    }

    public void setDeactivationId(Long deactivationId) {
        this.deactivationId = deactivationId;
    }

    public TeamJoinRequest getTeamJoinRequest() {
        return teamJoinRequest;
    }

    public void setTeamJoinRequest(TeamJoinRequest teamJoinRequest) {
        this.teamJoinRequest = teamJoinRequest;
    }

    public String getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(String previousStatus) {
        this.previousStatus = previousStatus;
    }

    public String getPresentStatus() {
        return presentStatus;
    }

    public void setPresentStatus(String presentStatus) {
        this.presentStatus = presentStatus;
    }

    public String getDeactivationReason() {
        return deactivationReason;
    }

    public void setDeactivationReason(String deactivationReason) {
        this.deactivationReason = deactivationReason;
    }

    public LocalDateTime getDeactivationDate() {
        return deactivationDate;
    }

    public void setDeactivationDate(LocalDateTime deactivationDate) {
        this.deactivationDate = deactivationDate;
    }
}
