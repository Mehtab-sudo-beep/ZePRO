package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deactivated_meetings")
public class DeactivatedMeeting {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long deactivationId;
    
    @ManyToOne
    @JoinColumn(name = "meeting_id", nullable = false)
    private Meeting meeting;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status")
    private MeetingStatus previousStatus;  // ✅ Status BEFORE deactivation (SCHEDULED)
    
    @Enumerated(EnumType.STRING)
    @Column(name = "present_status")
    private MeetingStatus presentStatus;   // ✅ Status at deactivation (CANCELLED)
    
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

    public Meeting getMeeting() {
        return meeting;
    }

    public void setMeeting(Meeting meeting) {
        this.meeting = meeting;
    }

    public MeetingStatus getPreviousStatus() {
        return previousStatus;
    }

    public void setPreviousStatus(MeetingStatus previousStatus) {
        this.previousStatus = previousStatus;
    }

    public MeetingStatus getPresentStatus() {
        return presentStatus;
    }

    public void setPresentStatus(MeetingStatus presentStatus) {
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