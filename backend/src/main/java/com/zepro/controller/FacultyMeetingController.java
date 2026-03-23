package com.zepro.controller;

import com.zepro.dto.faculty.CreateMeetingRequest;
import com.zepro.dto.faculty.MeetingResponse;
import com.zepro.model.Faculty;
import com.zepro.repository.FacultyRepository;
import com.zepro.service.MeetingService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/faculty/meetings")
public class FacultyMeetingController {

    private final MeetingService meetingService;
    private final FacultyRepository facultyRepository;

    public FacultyMeetingController(MeetingService meetingService,
                                    FacultyRepository facultyRepository) {
        this.meetingService = meetingService;
        this.facultyRepository = facultyRepository;
    }

    @PostMapping
    public MeetingResponse scheduleMeeting(@RequestBody CreateMeetingRequest request) {
        return meetingService.scheduleMeeting(request);
    }

    @PutMapping("/{meetingId}/cancel")
    public MeetingResponse cancelMeeting(@PathVariable("meetingId") Long meetingId) {
        return meetingService.cancelMeeting(meetingId);
    }


    @GetMapping("/request/{requestId}")
    public MeetingResponse getMeeting(@PathVariable("requestId") Long requestId) {
        return meetingService.getMeetingByRequest(requestId);
    }

    @GetMapping
    public List<MeetingResponse> getAllMeetings(Authentication authentication) {

        String email = authentication.getName();

        Faculty faculty = facultyRepository
                .findByUser_Email(email)
                .orElseThrow();

        return meetingService.getAllMeetings(faculty.getFacultyId());
    }

    @PutMapping("/{meetingId}/complete")
public MeetingResponse completeMeeting(@PathVariable("meetingId") Long meetingId) {
    return meetingService.completeMeeting(meetingId);
}

@PutMapping("/request/{requestId}/accept")
public void acceptProject(@PathVariable("requestId") Long requestId) {
    meetingService.acceptProject(requestId);
}

@PutMapping("/request/{requestId}/reject")
public void rejectProject(@PathVariable("requestId") Long requestId) {
    meetingService.rejectProject(requestId);
}
}