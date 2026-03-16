package com.zepro.controller;

import com.zepro.dto.faculty.CreateMeetingRequest;
import com.zepro.dto.faculty.MeetingResponse;
import com.zepro.service.MeetingService;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/faculty/meetings")
public class FacultyMeetingController {

    private final MeetingService meetingService;

    public FacultyMeetingController(MeetingService meetingService) {
        this.meetingService = meetingService;
    }

    @PostMapping
    public MeetingResponse scheduleMeeting(@RequestBody CreateMeetingRequest request) {
        return meetingService.scheduleMeeting(request);
    }

    @PutMapping("/{meetingId}/cancel")
    public MeetingResponse cancelMeeting(@PathVariable Long meetingId) {
        return meetingService.cancelMeeting(meetingId);
    }

    @PutMapping("/{meetingId}/complete")
    public MeetingResponse completeMeeting(@PathVariable Long meetingId) {
        return meetingService.completeMeeting(meetingId);
    }

    @GetMapping("/request/{requestId}")
    public MeetingResponse getMeeting(@PathVariable Long requestId) {
        return meetingService.getMeetingByRequest(requestId);
    }
    @GetMapping
public List<MeetingResponse> getAllMeetings() {
    return meetingService.getAllMeetings();
}
}