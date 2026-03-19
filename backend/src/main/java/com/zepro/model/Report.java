package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reportId;

    private String reportType;

    private String generatedBy;

    private String generatedRole; // ADMIN / COORDINATOR

    private LocalDateTime generatedAt;

    private String filtersApplied;

    private String filePath;
}
