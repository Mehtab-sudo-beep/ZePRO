package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class CoordinatorRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ruleId;

    private Integer maxTeamSize;

    private Integer maxStudentsPerFaculty;

    private LocalDate proposalDeadline;
}