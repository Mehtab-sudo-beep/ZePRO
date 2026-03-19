package com.zepro.controller;

import com.zepro.model.Meeting;
import com.zepro.service.MeetingService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/meetings")
public class MeetingController {

    private final MeetingService meetingService;

    public MeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping("/schedule")
    public Meeting scheduleMeeting(@RequestBody Meeting meeting) {
        return meetingService.scheduleMeeting(meeting);
    }
}