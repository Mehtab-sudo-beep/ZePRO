package com.zepro.controller;

import com.zepro.dto.student.*;
import com.zepro.service.StudentService;
import com.zepro.model.Project;
import com.zepro.model.TeamJoinRequest;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.zepro.repository.ProjectRepository;

@RestController
@RequestMapping("/student")
@CrossOrigin
public class StudentController {

    private final StudentService studentService;
    private final ProjectRepository projectRepository;

    public StudentController(StudentService studentService, ProjectRepository projectRepository) {
        this.studentService = studentService;
        this.projectRepository = projectRepository;
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
    public AssignedProjectResponse getAssignedProject(@PathVariable("studentId") Long studentId) {
        return studentService.getAssignedProject(studentId);
    }

    // View all project requests sent by the team lead (status: UPCOMING &
    // COMPLETED)
    @GetMapping("/project-requests/{studentId}")
    public ProjectRequestStatusResponse getProjectRequestsStatus(@PathVariable("studentId") Long studentId) {
        return studentService.getProjectRequestsStatus(studentId);
    }

    // Get team info for a student
    @GetMapping("/team-info/{studentId}")
    public TeamInfoResponse getTeamInfo(@PathVariable("studentId") Long studentId) {
        return studentService.getTeamInfo(studentId);
    }

    @PostMapping("/send-join-request")
    public String sendJoinRequest(@RequestBody JoinTeamRequest request) {
        return studentService.sendJoinRequest(
                request.getStudentId(),
                request.getTeamId());
    }

    @GetMapping("/team-join-requests/{studentId}")
    public List<JoinRequestResponse> getTeamJoinRequests(@PathVariable("studentId") Long studentId) {
        return studentService.getTeamJoinRequests(studentId);
    }

    @PostMapping("/approve-request/{requestId}")
    public String approveRequest(@PathVariable("requestId") Long requestId) {
        return studentService.approveJoinRequest(requestId);
    }

    @PostMapping("/reject-request/{requestId}")
    public String rejectRequest(
            @PathVariable("requestId") Long requestId,
            @RequestBody(required = false) HandleJoinRequestDTO dto) {
        String reason = (dto != null) ? dto.getRejectionReason() : "";
        return studentService.rejectJoinRequest(requestId, reason);
    }

    @GetMapping("/teams/{studentId}")
    public List<TeamListResponse> getAllTeams(@PathVariable("studentId") Long studentId) {
        return studentService.getAllTeams(studentId);
    }

    @GetMapping("/sent-requests/{studentId}")
    public List<SentRequestResponse> getSentRequests(@PathVariable("studentId") Long studentId) {
        return studentService.getSentRequests(studentId);
    }

    @GetMapping("/projects")
    public List<ProjectResponse> getAllProjects(java.security.Principal principal) {
        return studentService.getAllProjects(principal.getName());
    }

    @GetMapping("/project-request-history/{studentId}")
    public List<ProjectRequestHistoryResponse> getProjectRequestHistory(
            @PathVariable("studentId") Long studentId) {

        return studentService.getProjectRequestsHistory(studentId);
    }

    @GetMapping("/requested-projects/{studentId}")
    public List<Long> getRequestedProjects(@PathVariable("studentId") Long studentId) {
        return studentService.getRequestedProjects(studentId);
    }

    @GetMapping("/meeting-details/{requestId}")
    public MeetingDetailsResponse getMeetingDetails(@PathVariable("requestId") Long requestId) {
        return studentService.getMeetingDetails(requestId);
    }

    @GetMapping("/team-project-requests/{studentId}")
    public List<TeamProjectRequestResponse> getTeamProjectRequests(@PathVariable("studentId") Long studentId) {
        return studentService.getTeamProjectRequests(studentId);
    }
}