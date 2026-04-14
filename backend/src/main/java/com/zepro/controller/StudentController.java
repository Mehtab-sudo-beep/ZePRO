package com.zepro.controller;

import com.zepro.dto.student.*;
import com.zepro.service.StudentService;
import com.zepro.model.Faculty;
import com.zepro.model.Meeting;
import com.zepro.model.MeetingStatus;
import com.zepro.model.Project;
import com.zepro.model.ProjectRequest;
import com.zepro.model.RequestStatus;
import com.zepro.model.TeamJoinRequest;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;
import org.springframework.web.bind.annotation.*;
import com.zepro.repository.ProjectRepository;
import com.zepro.repository.ProjectRequestRepository;
import com.zepro.repository.MeetingRepository;
import org.springframework.http.ResponseEntity; 
import org.springframework.http.HttpStatus;
import com.zepro.model.Student;
import com.zepro.model.Team;
import com.zepro.repository.StudentRepository;
import com.zepro.repository.DepartmentRepository;

@RestController
@RequestMapping("/student")
@CrossOrigin
public class StudentController {

    private final StudentService studentService;
    private final ProjectRepository projectRepository;
    private final ProjectRequestRepository projectRequestRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final MeetingRepository meetingRepository;

    public StudentController(StudentService studentService, 
            ProjectRepository projectRepository,
            ProjectRequestRepository projectRequestRepository,
            StudentRepository studentRepository, 
            DepartmentRepository departmentRepository,
            MeetingRepository meetingRepository) {
        this.studentService = studentService;
        this.projectRepository = projectRepository;
        this.projectRequestRepository = projectRequestRepository;
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
        this.meetingRepository = meetingRepository;
    }

    @PostMapping("/create-team")
    public TeamResponse createTeam(@RequestBody CreateTeamRequest request) {
        return studentService.createTeam(request);
    }

    @PostMapping("/join-team")
    public String joinTeam(@RequestBody JoinTeamRequest request) {
        return studentService.joinTeam(request);
    }

    // LEAVE TEAM
    @PostMapping("/leave-team/{studentId}")
    public String leaveTeam(@PathVariable("studentId") Long studentId) {
        return studentService.leaveTeam(studentId);
    }

    // TRANSFER TEAM LEAD
    @PostMapping("/transfer-lead")
    public String transferTeamLead(@RequestBody TransferLeadRequest request) {
        return studentService.transferTeamLead(request.getTeamId(), request.getCurrentLeadId(), request.getNewLeadId());
    }

    // TEAM LEAD SENDS PROJECT REQUEST
    @PostMapping("/request-project")
    public String requestProject(@RequestBody ProjectRequestDTO request) {
        return studentService.requestProject(request);
    }

    // STUDENT CHECKS ASSIGNED PROJECT (FIXED - FINAL VERSION)
    @GetMapping("/assigned-project/{studentId}")
    public ResponseEntity<?> getAssignedProject(@PathVariable Long studentId) {
        System.out.println("\n╔════════════════════════════════════════╗");
        System.out.println("║   GET ASSIGNED PROJECT ENDPOINT        ║");
        System.out.println("╚════════════════════════════════════════╝");
        System.out.println("[StudentController] 📡 GET /assigned-project/" + studentId);
        
        try {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            System.out.println("[StudentController] 👤 Student Found: " + student.getUser().getName());
            System.out.println("[StudentController] 📌 Student ID: " + studentId);
            System.out.println("[StudentController] 📍 Allocated Faculty: " + 
                    (student.getAllocatedFaculty() != null ? student.getAllocatedFaculty().getFacultyId() : "null"));
            
            Team team = student.getTeam();
            
            // ✅ METHOD 1: Check if student has directly allocated faculty
            if (student.getAllocatedFaculty() != null && student.getAllocatedFaculty().getFacultyId() != null) {
                System.out.println("[StudentController] ✅ METHOD 1: Student has allocated faculty");
                
                List<Project> allocatedProjects = projectRepository.findByFacultyFacultyIdAndStatusAndTeam(
                        student.getAllocatedFaculty().getFacultyId(), 
                        "ASSIGNED", 
                        team);
                        
                if (!allocatedProjects.isEmpty()) {
                    Project project = allocatedProjects.get(0);
                    System.out.println("[StudentController] ✅ Found assigned project: " + project.getTitle());
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("projectId", project.getProjectId());
                    response.put("projectTitle", project.getTitle());
                    response.put("description", project.getDescription());
                    response.put("status", "ASSIGNED");
                    response.put("projectStatus", project.getStatus());
                    response.put("facultyName", project.getFaculty().getUser().getName());
                    response.put("teamId", team != null ? team.getTeamId() : null);
                    response.put("teamName", team != null ? team.getTeamName() : null);
                    
                    return ResponseEntity.ok(response);
                }
            }
            
            // ✅ METHOD 2: Check via team and ACCEPTED request
            if (team != null) {
                System.out.println("[StudentController] 📋 METHOD 2: Checking via team");
                System.out.println("[StudentController] 🔍 Team ID: " + team.getTeamId());
                
                List<ProjectRequest> teamRequests = projectRequestRepository.findByTeamTeamId(team.getTeamId());
                System.out.println("[StudentController] 📊 Team has " + teamRequests.size() + " project requests");
                
                for (ProjectRequest pr : teamRequests) {
                    System.out.println("[StudentController] 🔎 Request ID: " + pr.getRequestId() 
                            + " | Status: " + pr.getStatus()
                            + " | Project: " + pr.getProject().getTitle()
                            + " | Project Status: " + pr.getProject().getStatus());
                    
                    // ✅ If request is ACCEPTED and project is ASSIGNED → this is our project
                    if (pr.getStatus() == RequestStatus.ACCEPTED && 
                        "ASSIGNED".equals(pr.getProject().getStatus())) {
                        System.out.println("[StudentController] ✅ Found ACCEPTED & ASSIGNED project!");
                        
                        Project project = pr.getProject();
                        Map<String, Object> response = new HashMap<>();
                        response.put("projectId", project.getProjectId());
                        response.put("projectTitle", project.getTitle());
                        response.put("description", project.getDescription());
                        response.put("status", "ASSIGNED");
                        response.put("projectStatus", project.getStatus());
                        response.put("facultyName", project.getFaculty().getUser().getName());
                        response.put("teamId", team.getTeamId());
                        response.put("teamName", team.getTeamName());
                        
                        return ResponseEntity.ok(response);
                    }
                }
            }
            
            // ✅ METHOD 3: Direct team-project link
            if (team != null) {
                System.out.println("[StudentController] 🔄 METHOD 3: Checking direct team-project link");
                
                Project project = projectRepository.findByTeamAndStatus(team, "ASSIGNED");
                
                if (project != null) {
                    System.out.println("[StudentController] ✅ Found project via team link!");
                    
                    Map<String, Object> response = new HashMap<>();
                    response.put("projectId", project.getProjectId());
                    response.put("projectTitle", project.getTitle());
                    response.put("description", project.getDescription());
                    response.put("status", "ASSIGNED");
                    response.put("projectStatus", project.getStatus());
                    response.put("facultyName", project.getFaculty().getUser().getName());
                    response.put("teamId", team.getTeamId());
                    response.put("teamName", team.getTeamName());
                    
                    return ResponseEntity.ok(response);
                }
            }
            
            // ✅ If no project found
            System.out.println("[StudentController] ❌ No assigned project found");
            
            Map<String, Object> response = new HashMap<>();
            response.put("projectTitle", "Project not assigned yet");
            response.put("status", "NOT_ASSIGNED");
            response.put("projectId", null);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("[StudentController] ❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("projectTitle", "Project not assigned yet");
            error.put("status", "ERROR");
            error.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // View all project requests sent by the team lead (status: UPCOMING & COMPLETED)
    @GetMapping("/project-requests/{studentId}")
public ProjectRequestStatusResponse getProjectRequestsStatus(@PathVariable("studentId") Long studentId) {
    System.out.println("[StudentController] 📡 GET /project-requests/" + studentId);
    
    Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

    Team team = student.getTeam();

    if (team == null) {
        throw new RuntimeException("Student is not in a team");
    }

    List<ProjectRequest> requests = projectRequestRepository.findByTeamTeamId(team.getTeamId());

    List<UpcomingRequestResponse> upcoming = new ArrayList<>();
    List<CompletedRequestResponse> completed = new ArrayList<>();

    for (ProjectRequest req : requests) {
        Project project = req.getProject();
        String status = req.getStatus() != null ? req.getStatus().name() : "";

        System.out.println("[StudentController] 📋 Processing request: " + req.getRequestId() 
                + " | Project: " + project.getTitle() 
                + " | Request Status: " + status);

        // ✅ CHECK 1: If request is REJECTED → goes to completed
        if (status.equals("REJECTED")) {
            System.out.println("[StudentController] ❌ Request REJECTED");
            CompletedRequestResponse completedResp = new CompletedRequestResponse();
            completedResp.setRequestId(req.getRequestId());
            completedResp.setProjectTitle(project.getTitle());
            completedResp.setFacultyName(project.getFaculty().getUser().getName());
            completedResp.setStatus("REJECTED");
            completedResp.setRejectionReason(req.getRejectionReason());
            completed.add(completedResp);
            continue;
        }

        // ✅ CHECK 2: If request is CANCELLED → goes to completed
        if (status.equals("CANCELLED")) {
            System.out.println("[StudentController] ❌ Request CANCELLED");
            CompletedRequestResponse completedResp = new CompletedRequestResponse();
            completedResp.setRequestId(req.getRequestId());
            completedResp.setProjectTitle(project.getTitle());
            completedResp.setFacultyName(project.getFaculty().getUser().getName());
            completedResp.setStatus("CANCELLED");
            completedResp.setRejectionReason(req.getRejectionReason());
            completed.add(completedResp);
            continue;
        }

        // ✅ CHECK 3: If project is CLOSE/DEACTIVATED → goes to completed with rejection reason
        if ("CLOSE".equals(project.getStatus())) {
            System.out.println("[StudentController] ❌ Project CLOSED");
            CompletedRequestResponse completedResp = new CompletedRequestResponse();
            completedResp.setRequestId(req.getRequestId());
            completedResp.setProjectTitle(project.getTitle());
            completedResp.setFacultyName(project.getFaculty().getUser().getName());
            completedResp.setStatus("PROJECT_CLOSED");
            completedResp.setRejectionReason("Project closed by faculty");
            completed.add(completedResp);
            continue;
        }

        // ✅ CHECK 4: If request is ACCEPTED → goes to completed
        if (status.equals("ACCEPTED")) {
            System.out.println("[StudentController] ✅ Request ACCEPTED");
            CompletedRequestResponse completedResp = new CompletedRequestResponse();
            completedResp.setRequestId(req.getRequestId());
            completedResp.setProjectTitle(project.getTitle());
            completedResp.setFacultyName(project.getFaculty().getUser().getName());
            completedResp.setStatus("ACCEPTED");
            completed.add(completedResp);
            continue;
        }

        // ✅ CHECK 5: Check if meeting exists for this request
        java.util.Optional<Meeting> meetingOpt = meetingRepository.findByRequestRequestId(req.getRequestId());

        if (meetingOpt.isPresent()) {
            Meeting meeting = meetingOpt.get();
            System.out.println("[StudentController] 📞 Meeting found: " + meeting.getMeetingId() 
                    + " | Meeting Status: " + meeting.getStatus());

            // ✅ If meeting is CANCELLED → goes to completed
            if (meeting.getStatus() == MeetingStatus.CANCELLED) {
                System.out.println("[StudentController] ❌ Meeting CANCELLED");
                CompletedRequestResponse completedResp = new CompletedRequestResponse();
                completedResp.setRequestId(req.getRequestId());
                completedResp.setProjectTitle(project.getTitle());
                completedResp.setFacultyName(project.getFaculty().getUser().getName());
                completedResp.setStatus("MEETING_CANCELLED");
                completedResp.setRejectionReason("Meeting cancelled by faculty");
                completed.add(completedResp);
                continue;
            }

            // ✅ If meeting is DONE but request is SCHEDULED → goes to completed (awaiting decision)
            if (meeting.getStatus() == MeetingStatus.DONE && status.equals("SCHEDULED")) {
                System.out.println("[StudentController] ⏳ Meeting DONE, awaiting decision");
                CompletedRequestResponse completedResp = new CompletedRequestResponse();
                completedResp.setRequestId(req.getRequestId());
                completedResp.setProjectTitle(project.getTitle());
                completedResp.setFacultyName(project.getFaculty().getUser().getName());
                completedResp.setStatus("MEETING_COMPLETED");
                completed.add(completedResp);
                continue;
            }

            // ✅ If meeting is SCHEDULED → goes to upcoming
            if (meeting.getStatus() == MeetingStatus.SCHEDULED) {
                System.out.println("[StudentController] 📅 Meeting SCHEDULED → Upcoming");
                UpcomingRequestResponse upcomingResp = new UpcomingRequestResponse();
                upcomingResp.setRequestId(req.getRequestId());
                upcomingResp.setProjectTitle(project.getTitle());
                upcomingResp.setFacultyName(project.getFaculty().getUser().getName());
                upcomingResp.setMeetingTime(meeting.getMeetingTime());
                upcomingResp.setLocation(meeting.getLocation());
                upcomingResp.setMeetingLink(meeting.getMeetingLink());
                upcoming.add(upcomingResp);
                continue;
            }
        }

        // ✅ CHECK 6: If no meeting and status is PENDING → upcoming (waiting for faculty to schedule)
        if (status.equals("PENDING")) {
            System.out.println("[StudentController] ⏳ PENDING - waiting for faculty");
            UpcomingRequestResponse upcomingResp = new UpcomingRequestResponse();
            upcomingResp.setRequestId(req.getRequestId());
            upcomingResp.setProjectTitle(project.getTitle());
            upcomingResp.setFacultyName(project.getFaculty().getUser().getName());
            upcoming.add(upcomingResp);
        }
    }

    // ✅ Sort upcoming by meetingTime ascending
    upcoming.sort((a, b) -> {
        if (a.getMeetingTime() == null || b.getMeetingTime() == null) return 0;
        return a.getMeetingTime().compareTo(b.getMeetingTime());
    });

    System.out.println("[StudentController] 📊 Summary - Upcoming: " + upcoming.size() + " | Completed: " + completed.size());

    ProjectRequestStatusResponse response = new ProjectRequestStatusResponse();
    response.setUpcomingRequests(upcoming);
    response.setCompletedRequests(completed);

    return response;
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
    public ResponseEntity<?> completeProfile(
            @PathVariable Long studentId,
            @RequestBody CompleteStudentProfileRequest request) {
        
        System.out.println("\n╔════════════════════════════════════════╗");
        System.out.println("║   COMPLETE PROFILE API ENDPOINT        ║");
        System.out.println("╚════════════════════════════════════════╝");
        System.out.println("[StudentController] POST /student/complete-profile/" + studentId);
        
        try {
            System.out.println("[StudentController] 📥 Request body:");
            System.out.println("  - Roll Number: " + request.getRollNumber());
            System.out.println("  - CGPA: " + request.getCgpa());
            System.out.println("  - Year: " + request.getYear());
            System.out.println("  - Phone: " + request.getPhone());
            System.out.println("  - Institute ID: " + request.getInstituteId());
            System.out.println("  - Department ID: " + request.getDepartmentId());
            System.out.println("  - Resume Link: " + request.getResumeLink());
            System.out.println("  - Marksheet Link: " + request.getMarksheetLink());
            
            StudentProfileResponse response = studentService.completeStudentProfile(studentId, request);
            
            System.out.println("\n[StudentController] ✅ RESPONSE:");
            System.out.println("  - Student ID: " + response.getStudentId());
            System.out.println("  - Name: " + response.getName());
            System.out.println("  - Email: " + response.getEmail());
            System.out.println("  - Roll Number: " + response.getRollNumber());
            System.out.println("  - CGPA: " + response.getCgpa());
            System.out.println("  - Year: " + response.getYear());
            System.out.println("  - Is Profile Complete: " + response.isProfileComplete());
            System.out.println();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[StudentController] ❌ ERROR: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", new java.util.Date());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    // ✅ GET PROFILE COMPLETION STATUS
    @GetMapping("/profile-status/{studentId}")
    public ResponseEntity<?> getProfileStatus(@PathVariable Long studentId) {
        
        System.out.println("\n╔════════════════════════════════════════╗");
        System.out.println("║      GET PROFILE STATUS ENDPOINT       ║");
        System.out.println("╚════════════════════════════════════════╝");
        System.out.println("[StudentController] 📡 GET /student/profile-status/" + studentId);
        
        try {
            StudentProfileResponse response = studentService.getProfileStatus(studentId);
            
            System.out.println("[StudentController] ✅ Profile Status Response:");
            System.out.println("  - Student ID: " + response.getStudentId());
            System.out.println("  - Name: " + response.getName());
            System.out.println("  - Email: " + response.getEmail());
            System.out.println("  - Roll Number: " + response.getRollNumber());
            System.out.println("  - CGPA: " + response.getCgpa());
            System.out.println("  - Year: " + response.getYear());
            System.out.println("  - Department ID: " + response.getDepartmentId());
            System.out.println("  - Department Name: " + response.getDepartmentName());
            System.out.println("  - Resume Link: " + response.getResumeLink());
            System.out.println("  - Marksheet Link: " + response.getMarksheetLink());
            System.out.println("  - Is Profile Complete: " + response.isProfileComplete());
            System.out.println();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[StudentController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", new java.util.Date());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
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
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}