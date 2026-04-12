package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deactivated_project_requests")
public class DeactivatedProjectRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deactivationId;

    @ManyToOne
    @JoinColumn(name = "request_id", nullable = false)
    private ProjectRequest projectRequest;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private RequestStatus previousStatus;  // ✅ Status BEFORE deactivation

    @Enumerated(EnumType.STRING)
    @Column(name = "present_status")
    private RequestStatus presentStatus;   // ✅ Status at deactivation (REJECTED)

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

    public ProjectRequest getProjectRequest() {
        return projectRequest;
    }

    public void setProjectRequest(ProjectRequest projectRequest) {
        this.projectRequest = projectRequest;
    }

    public RequestStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(RequestStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public RequestStatus getPresentStatus() {
        return presentStatus;
    }

    public void setPresentStatus(RequestStatus presentStatus) {
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