package com.zepro.controller;

import com.zepro.model.Meeting;
import com.zepro.service.MeetingService;

import org.springframework.web.bind.annotation.*;

import com.zepro.dto.faculty.CreateMeetingRequest;
import com.zepro.dto.faculty.MeetingResponse;

@RestController
@RequestMapping("/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping("/schedule")
    public MeetingResponse scheduleMeeting(@RequestBody CreateMeetingRequest request) {
        return meetingService.scheduleMeeting(request);
    }
}