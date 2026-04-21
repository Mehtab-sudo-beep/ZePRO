package com.zepro.controller;

import com.zepro.dto.faculty.CreateMeetingRequest;
import com.zepro.dto.faculty.MeetingResponse;
import com.zepro.model.Faculty;
import com.zepro.repository.FacultyRepository;
import com.zepro.service.MeetingService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.OK;
import org.springframework.http.ResponseEntity;
import java.util.HashMap;
import java.util.Map;
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
    public List<MeetingResponse> getAllMeetings(
            @RequestParam(required = false) String degree,
            Authentication authentication) {

        String email = authentication.getName();

        Faculty faculty = facultyRepository
                .findByUser_Email(email)
                .orElseThrow();

        return meetingService.getAllMeetings(faculty.getFacultyId(), degree);
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
public void rejectProject(@PathVariable("requestId") Long requestId, @RequestBody(required = false) java.util.Map<String, String> body) {
    String reason = (body != null && body.containsKey("reason")) ? body.get("reason") : "";
    meetingService.rejectProject(requestId, reason);
}

@PutMapping("/request/{requestId}/reschedule")
public MeetingResponse rescheduleMeeting(@PathVariable("requestId") Long requestId, @RequestBody CreateMeetingRequest request) {
    return meetingService.rescheduleMeeting(requestId, request);
}

@PostMapping("/{projectId}/assign-team/{teamId}")
public ResponseEntity<?> assignProjectToTeam(
        @PathVariable("projectId") Long projectId,
        @PathVariable("teamId") Long teamId) {
    try {
        System.out.println("[FacultyMeetingController] 📧 Assigning project to team with email notification");
        
        meetingService.assignProjectAndSendEmail(projectId, teamId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("message", "Project assigned successfully and email sent to team members");
        result.put("projectId", projectId);
        result.put("teamId", teamId);
        
        System.out.println("[FacultyMeetingController] ✅ Project assigned: " + projectId);
        return ResponseEntity.ok(result);
    } catch (RuntimeException e) {
        System.out.println("[FacultyMeetingController] ❌ Error: " + e.getMessage());
        Map<String, Object> error = new HashMap<>();
        error.put("error", e.getMessage());
        return ResponseEntity.status(BAD_REQUEST).body(error);
    } catch (Exception e) {
        System.out.println("[FacultyMeetingController] ❌ Error: " + e.getMessage());
        Map<String, Object> error = new HashMap<>();
        error.put("error", "Failed to assign project");
        error.put("details", e.getMessage());
        return ResponseEntity.status(INTERNAL_SERVER_ERROR).body(error);
    }
}
}