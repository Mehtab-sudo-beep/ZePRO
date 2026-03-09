package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long logId;

    private String action;

    private String performedBy;

    private String role;

    private String entityAffected;

    private Long entityId;

    private LocalDateTime timestamp;

    private String description;
}