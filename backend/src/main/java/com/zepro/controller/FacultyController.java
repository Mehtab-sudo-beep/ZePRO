package com.zepro.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.zepro.dto.faculty.AssignProjectRequest;
import com.zepro.dto.faculty.CompleteFacultyProfileRequest;
import com.zepro.dto.faculty.CreateProjectRequest;
import com.zepro.dto.faculty.DomainRequest;
import com.zepro.dto.faculty.FacultyProfileResponse;
import com.zepro.dto.faculty.ProjectResponse;
import com.zepro.dto.faculty.SubDomainRequest;
import com.zepro.dto.student.DepartmentDTO;
import com.zepro.dto.student.InstituteDTO;
import com.zepro.model.Domain;
import com.zepro.model.Faculty;
import com.zepro.model.ProjectRequest;
import com.zepro.model.SubDomain;
import com.zepro.repository.FacultyRepository;
import com.zepro.service.DomainService;
import com.zepro.service.FacultyService;
import com.zepro.service.RequestService;
import com.zepro.service.StudentService;
import com.zepro.service.MeetingService;

@RestController
@RequestMapping("/faculty")
@CrossOrigin
public class FacultyController {

    private final FacultyService facultyService;
    private final DomainService domainService;
    private final FacultyRepository facultyRepository;
    private final RequestService requestService;
    private final StudentService studentService;
    private final MeetingService meetingService;

    public FacultyController(FacultyService facultyService,
                             DomainService domainService,
                             FacultyRepository facultyRepository,
                             RequestService requestService,
                             StudentService studentService,
                             MeetingService meetingService) {

        this.facultyService = facultyService;
        this.domainService = domainService;
        this.facultyRepository = facultyRepository;
        this.requestService = requestService;
        this.studentService = studentService;
        this.meetingService = meetingService;
    }

    // ✅ GET ALL INSTITUTES
    @GetMapping("/institutes")
    public ResponseEntity<?> getAllInstitutes() {
        System.out.println("[FacultyController] 📡 GET /faculty/institutes");
        try {
            List<InstituteDTO> institutes = facultyService.getAllInstitutes();
            System.out.println("[FacultyController] ✅ Returning " + institutes.size() + " institutes");
            return ResponseEntity.ok(institutes);
        } catch (Exception e) {
            System.out.println("[FacultyController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ GET DEPARTMENTS BY INSTITUTE
    @GetMapping("/departments/{instituteId}")
    public ResponseEntity<?> getDepartmentsByInstitute(@PathVariable Long instituteId) {
        System.out.println("[FacultyController] 📡 GET /faculty/departments/" + instituteId);
        try {
            List<DepartmentDTO> departments = facultyService.getDepartmentsByInstitute(instituteId);
            System.out.println("[FacultyController] ✅ Returning " + departments.size() + " departments");
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            System.out.println("[FacultyController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }


    // ✅ GET FACULTY PROFILE STATUS
    @GetMapping("/profile-status/{facultyId}")
    public ResponseEntity<?> getFacultyProfileStatus(@PathVariable Long facultyId) {
        System.out.println("\n[FacultyController] 🔍 GET /faculty/profile-status/" + facultyId);
        try {
            FacultyProfileResponse response = facultyService.getFacultyProfileStatus(facultyId);
            System.out.println("[FacultyController] ✅ Profile Complete: " + response.isProfileComplete());
            System.out.println("[FacultyController] Employee ID: " + response.getEmployeeId());
            System.out.println("[FacultyController] Designation: " + response.getDesignation());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[FacultyController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ COMPLETE FACULTY PROFILE
    @PostMapping("/complete-profile/{facultyId}")
    public ResponseEntity<?> completeFacultyProfile(
            @PathVariable Long facultyId,
            @RequestBody CompleteFacultyProfileRequest request) {
        
        System.out.println("\n[FacultyController] 📝 POST /faculty/complete-profile/" + facultyId);
        System.out.println("[FacultyController] ═══════════════════════════════════════");
        System.out.println("[FacultyController] Employee ID: " + request.getEmployeeId());
        System.out.println("[FacultyController] Designation: " + request.getDesignation());
        System.out.println("[FacultyController] Department ID: " + request.getDepartmentId());
        System.out.println("[FacultyController] Institute ID: " + request.getInstituteId());
        
        try {
            FacultyProfileResponse response = facultyService.completeFacultyProfile(facultyId, request);
            System.out.println("[FacultyController] ✅ Profile completed successfully");
            System.out.println("[FacultyController] Is Complete: " + response.isProfileComplete());
            System.out.println("[FacultyController] ═══════════════════════════════════════\n");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[FacultyController] ❌ Error: " + e.getMessage());
            System.out.println("[FacultyController] ═══════════════════════════════════════\n");
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ EXISTING ENDPOINTS BELOW (KEEP ALL)

    @GetMapping("/allocation-rules")
    public ResponseEntity<?> getAllocationRules(Authentication authentication) {
        System.out.println("[FacultyController] 📡 GET /faculty/allocation-rules");
        try {
            String email = authentication.getName();
            com.zepro.model.AllocationRules rules = facultyService.getAllocationRulesByEmail(email);
            return ResponseEntity.ok(Map.of(
                "maxTeamSize", rules.getMaxTeamSize(),
                "maxStudentsPerFaculty", rules.getMaxStudentsPerFaculty(),
                "maxProjectsPerFaculty", rules.getMaxProjectsPerFaculty(),
                "maxSlotsPerProject", rules.getMaxSlotsPerProject()
            ));
        } catch (Exception e) {
            System.out.println("[FacultyController] ❌ Error fetching rules: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/project")
    public ProjectResponse createProject(
            @RequestBody CreateProjectRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        Faculty faculty = facultyRepository
                .findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        return facultyService.createProject(request, faculty);
    }

    @PutMapping("/project/{projectId}")
    public ProjectResponse updateProject(
            @PathVariable Long projectId,
            @RequestBody CreateProjectRequest request,
            Authentication authentication) {

        String email = authentication.getName();

        Faculty faculty = facultyRepository
                .findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        return facultyService.updateProject(projectId, request, faculty);
    }

    @GetMapping("/my-projects")
    public List<ProjectResponse> getMyProjects(Authentication authentication) {
        String email = authentication.getName();
        return facultyService.getProjectsByEmail(email);
    }

    @PostMapping("/project/{projectId}/activate")
    public ProjectResponse activateProject(@PathVariable Long projectId, Authentication authentication) {

        String email = authentication.getName();

        Faculty faculty = facultyRepository
                .findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        return facultyService.activateProject(projectId, faculty);
    }

    @PostMapping("/project/{projectId}/deactivate")
    public ProjectResponse deactivateProject(@PathVariable Long projectId   , Authentication authentication) {
        String email = authentication.getName();

        Faculty faculty = facultyRepository
                .findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        return facultyService.deactivateProject(projectId, faculty);
    }

    @GetMapping("/pending-requests")
    public List<ProjectResponse> getPendingRequests(Authentication authentication) {

        String email = authentication.getName();

        Faculty faculty = facultyRepository
                .findByUser_Email(email)
                .orElseThrow();

        return facultyService.getPendingRequests(faculty.getFacultyId());
    }

    @PostMapping("/assign-project")
    public String assignProject(@RequestBody AssignProjectRequest request) {

        meetingService.acceptProject(
                request.getProjectId()
        );

        return "Project assigned";
    }

    @PostMapping("/domain")
    public Domain createDomain(
            @RequestBody DomainRequest req,
            Authentication authentication) {

        String email = authentication.getName();

        Faculty faculty = facultyRepository
                .findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        return domainService.createDomain(req.getName(), faculty);
    }

    @PostMapping("/subdomain")
    public SubDomain createSubDomain(@RequestBody SubDomainRequest req) {
        return facultyService.createSubDomain(req.getName(), req.getDomainId());
    }

    @PutMapping("/requests/{requestId}/cancel")
    public ProjectRequest cancelRequest(@PathVariable("requestId") Long requestId) {
        return requestService.cancelRequest(requestId);
    }
}