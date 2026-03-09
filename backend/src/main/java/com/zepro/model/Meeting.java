package com.zepro.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long meetingId;

    @OneToOne
    @JoinColumn(name = "request_id")
    private ProjectRequest request;

    private LocalDateTime meetingTime;
    private String meetingLink;
}