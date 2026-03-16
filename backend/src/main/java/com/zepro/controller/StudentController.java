package com.zepro.controller;

import com.zepro.dto.student.*;
import com.zepro.service.StudentService;
import com.zepro.model.TeamJoinRequest;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/create-team")
    public TeamResponse createTeam(@RequestBody CreateTeamRequest request) {
        return studentService.createTeam(request);
    }

    @PostMapping("/join-team")
    public String joinTeam(@RequestBody JoinTeamRequest request) {
        return studentService.joinTeam(request);
    }

    // TEAM LEAD SENDS PROJECT REQUEST
    @PostMapping("/request-project")
    public String requestProject(@RequestBody ProjectRequestDTO request) {
        return studentService.requestProject(request);
    }

    // STUDENT CHECKS ASSIGNED PROJECT
    @GetMapping("/assigned-project/{studentId}")
    public AssignedProjectResponse getAssignedProject(@PathVariable Long studentId) {
        return studentService.getAssignedProject(studentId);
    }

    // View all project requests sent by the team lead (status: UPCOMING & COMPLETED)
    @GetMapping("/project-requests/{studentId}")
    public ProjectRequestStatusResponse getProjectRequestsStatus(@PathVariable Long studentId) {
        return studentService.getProjectRequestsStatus(studentId);
    }

    // Get team info for a student
    @GetMapping("/team-info/{studentId}")
    public TeamInfoResponse getTeamInfo(@PathVariable Long studentId) {
        return studentService.getTeamInfo(studentId);
    }
    @PostMapping("/send-join-request")
    public String sendJoinRequest(@RequestBody JoinTeamRequest request){
        return studentService.sendJoinRequest(
                request.getStudentId(),
                request.getTeamId()
        );
    }
    @GetMapping("/team-join-requests/{studentId}")
public List<JoinRequestResponse> getTeamJoinRequests(@PathVariable Long studentId){
    return studentService.getTeamJoinRequests(studentId);
}
    @PostMapping("/approve-request/{requestId}")
    public String approveRequest(@PathVariable Long requestId){
        return studentService.approveJoinRequest(requestId);
    }
    @PostMapping("/reject-request/{requestId}")
    public String rejectRequest(@PathVariable Long requestId){
        return studentService.rejectJoinRequest(requestId);
    }
    @GetMapping("/teams/{studentId}")
public List<TeamListResponse> getAllTeams(@PathVariable Long studentId) {
    return studentService.getAllTeams(studentId);
}
    @GetMapping("/sent-requests/{studentId}")
public List<SentRequestResponse> getSentRequests(@PathVariable Long studentId) {
    return studentService.getSentRequests(studentId);
}
}