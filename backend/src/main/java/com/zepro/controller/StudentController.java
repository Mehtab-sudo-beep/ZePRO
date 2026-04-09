package com.zepro.controller;

import com.zepro.dto.student.*;
import com.zepro.service.StudentService;
import com.zepro.model.Project;
import com.zepro.model.TeamJoinRequest;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.zepro.repository.ProjectRepository;
import org.springframework.http.ResponseEntity; 
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

    // ✅ COMPLETE STUDENT PROFILE (Mandatory after login)
    @PostMapping("/complete-profile/{studentId}")
    public ResponseEntity<?> completeStudentProfile(
            @PathVariable Long studentId,
            @RequestBody CompleteStudentProfileRequest request) {
        
        System.out.println("\n========== COMPLETE STUDENT PROFILE ==========");
        System.out.println("[StudentController] 📝 POST /student/complete-profile/" + studentId);
        
        try {
            StudentProfileResponse response = studentService.completeStudentProfile(studentId, request);
            System.out.println("[StudentController] ✅ Profile completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[StudentController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", new java.util.Date());
            
            return ResponseEntity.status(500).body(error);
        }
    }

    // ✅ GET PROFILE COMPLETION STATUS
    @GetMapping("/profile-status/{studentId}")
    public ResponseEntity<?> getProfileStatus(@PathVariable Long studentId) {
        
        System.out.println("\n========== GET PROFILE STATUS ==========");
        System.out.println("[StudentController] 📡 GET /student/profile-status/" + studentId);
        
        try {
            StudentProfileStatusResponse response = studentService.getProfileStatus(studentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[StudentController] ❌ Error: " + e.getMessage());
            
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("error", e.getMessage());
            
            return ResponseEntity.status(500).body(error);
        }
    }

    // ✅ GET ALL INSTITUTES
    @GetMapping("/institutes")
    public ResponseEntity<?> getAllInstitutes() {
        
        System.out.println("\n========== GET ALL INSTITUTES ==========");
        System.out.println("[StudentController] 📡 GET /student/institutes");
        
        try {
            List<InstituteDTO> response = studentService.getAllInstitutes();
            System.out.println("[StudentController] ✅ Fetched " + response.size() + " institutes");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[StudentController] ❌ Error: " + e.getMessage());
            
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("error", e.getMessage());
            
            return ResponseEntity.status(500).body(error);
        }
    }

    // ✅ GET DEPARTMENTS BY INSTITUTE
    @GetMapping("/departments/{instituteId}")
    public ResponseEntity<?> getDepartmentsByInstitute(@PathVariable Long instituteId) {
        
        System.out.println("\n========== GET DEPARTMENTS ==========");
        System.out.println("[StudentController] 📡 GET /student/departments/" + instituteId);
        
        try {
            List<DepartmentDTO> response = studentService.getDepartmentsByInstitute(instituteId);
            System.out.println("[StudentController] ✅ Fetched " + response.size() + " departments");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[StudentController] ❌ Error: " + e.getMessage());
            
            java.util.Map<String, Object> error = new java.util.HashMap<>();
            error.put("error", e.getMessage());
            
            return ResponseEntity.status(500).body(error);
        }
    }
}