package com.zepro.controller;
import com.zepro.dto.facultycoordinator.*;
import com.zepro.model.Faculty;
import com.zepro.repository.FacultyRepository;
import com.zepro.service.CoordinatorService;

import org.checkerframework.checker.units.qual.A;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coordinator")
@CrossOrigin
public class FacultyCoordinatorController {

    private final CoordinatorService coordinatorService;
    private final FacultyRepository facultyRepository;

    public FacultyCoordinatorController(CoordinatorService coordinatorService,
                                       FacultyRepository facultyRepository) {
        this.coordinatorService = coordinatorService;
        this.facultyRepository = facultyRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats(Authentication authentication) {
         System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/rules");
        try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);

           if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }
        return ResponseEntity.ok(coordinatorService.getDashboardStats(departmentId));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/faculties")
    public ResponseEntity<List<CoordinatorFacultyResponse>> getAllFaculties(Authentication authentication) {
         System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/faculties");
          try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);

           if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }
        return ResponseEntity.ok(coordinatorService.getAllFaculties(departmentId));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/faculties/search")
    public ResponseEntity<List<CoordinatorFacultyResponse>> searchFaculties(@RequestParam String q,Authentication authentication) {
         System.out.println("[FacultyCoordinatorController] 🔍 GET /api/coordinator/faculties/search?q=" + q);
        try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);

           if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }
        return ResponseEntity.ok(coordinatorService.searchFaculties(q,departmentId));    
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/students")
    public ResponseEntity<List<CoordinatorStudentResponse>> getAllStudents(Authentication authentication) {
         System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/students");
          try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);

           if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }
        return ResponseEntity.ok(coordinatorService.getAllStudents(departmentId));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/students/search")
    public ResponseEntity<List<CoordinatorStudentResponse>> searchStudents(@RequestParam String q, Authentication authentication) {
        try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);

           if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }
        return ResponseEntity.ok(coordinatorService.searchStudents(q, departmentId));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/students/allocated")
    public ResponseEntity<List<CoordinatorStudentResponse>> getAllocatedStudents(Authentication authentication) {
         System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/students/allocated");
          try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);

           if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }
        return ResponseEntity.ok(coordinatorService.getAllocatedStudents(departmentId));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/allocate")
    public ResponseEntity<String> allocateStudent(@RequestBody AllocateStudentRequest request) {
        coordinatorService.allocateStudentToFaculty(request);
        return ResponseEntity.ok("Student allocated successfully!");
    }

    @PostMapping("/override")
    public ResponseEntity<String> overrideAllocation(@RequestBody OverrideAllocationRequest request) {
        coordinatorService.overrideStudentAllocation(request);
        return ResponseEntity.ok("Allocation overridden successfully!");
    }

    @GetMapping("/teams")
    public ResponseEntity<List<CoordinatorTeamResponse>> getAllTeams(Authentication authentication) {
         System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/teams");
          try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);

           if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }
        return ResponseEntity.ok(coordinatorService.getAllTeams(departmentId));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/teams/report")
    public ResponseEntity<AllTeamsReportResponse> getAllTeamsReport(Authentication authentication) {
         System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/teams/report");
          try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);

           if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }
        return ResponseEntity.ok(coordinatorService.getAllTeamsReport(departmentId) );
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/teams/report/pdf")
    public ResponseEntity<byte[]> getAllTeamsReportPdf(Authentication authentication) {
         System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/teams/report/pdf");
          try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);

           if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }
        byte[] pdf = coordinatorService.generateAllTeamsReportPdf(departmentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"teams_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }

    }

    // ✅ GET RULES FOR COORDINATOR'S DEPARTMENT
    @GetMapping("/rules")
    public ResponseEntity<?> getRules(Authentication authentication) {
        System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/rules");
        try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);

            if (departmentId == null) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "Coordinator is not assigned to any department"
                ));
            }

            AllocationRulesResponse rules = coordinatorService.getRulesByDepartment(departmentId);
            System.out.println("[FacultyCoordinatorController] ✅ Rules fetched for department: " + departmentId);
            return ResponseEntity.ok(rules);
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ SAVE RULES FOR COORDINATOR'S DEPARTMENT
    @PostMapping("/rules")
    public ResponseEntity<?> saveRules(@RequestBody SaveRulesRequest request, Authentication authentication) {
        System.out.println("[FacultyCoordinatorController] 💾 POST /api/coordinator/rules");
        try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            System.out.println("[FacultyCoordinatorController] 👨‍🏫 Coordinator email: " + email);
            System.out.println("[FacultyCoordinatorController] 🏢 Department ID: " + departmentId);
            System.out.println("[FacultyCoordinatorController] 📊 New Rules:");
            System.out.println("[FacultyCoordinatorController]    - maxTeamSize: " + request.getMaxTeamSize());
            System.out.println("[FacultyCoordinatorController]    - maxStudentsPerFaculty: " + request.getMaxStudentsPerFaculty());
            System.out.println("[FacultyCoordinatorController]    - maxProjectsPerFaculty: " + request.getMaxProjectsPerFaculty());

            if (departmentId == null) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "Coordinator is not assigned to any department"
                ));
            }

            // ✅ SET DEPARTMENT ID FROM AUTHENTICATED USER
            request.setDepartmentId(departmentId);

            coordinatorService.saveRules(request);
            
            System.out.println("[FacultyCoordinatorController] ✅ Rules saved successfully for department: " + departmentId);
            return ResponseEntity.ok(Map.of(
                "message", "Rules updated successfully for department " + departmentId,
                "departmentId", departmentId
            ));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ GET DEADLINES FOR COORDINATOR'S DEPARTMENT
    @GetMapping("/deadlines")
    public ResponseEntity<?> getDeadlines(Authentication authentication) {
        System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/deadlines");
        try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            if (departmentId == null) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "Coordinator is not assigned to any department"
                ));
            }

            DepartmentDeadlinesDTO deadlines = coordinatorService.getDeadlines(departmentId);
            return ResponseEntity.ok(deadlines);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ SAVE DEADLINES FOR COORDINATOR'S DEPARTMENT
    @PostMapping("/deadlines")
    public ResponseEntity<?> saveDeadlines(@RequestBody DepartmentDeadlinesDTO request, Authentication authentication) {
        System.out.println("[FacultyCoordinatorController] 💾 POST /api/coordinator/deadlines");
        try {
            String email = authentication.getName();
            
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() 
                : null;

            if (departmentId == null) {
                return ResponseEntity.status(400).body(Map.of(
                    "error", "Coordinator is not assigned to any department"
                ));
            }

            coordinatorService.saveDeadlines(departmentId, request);
            return ResponseEntity.ok(Map.of("message", "Deadlines updated successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/student-team-details")
    public ResponseEntity<?> getStudentAndTeamDetails(Authentication authentication) {
        System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/student-team-details");
        try {
            String email = authentication.getName();
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() : null;

            if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }

            return ResponseEntity.ok(coordinatorService.getStudentAndTeamDetails(departmentId));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/available-teams")
    public ResponseEntity<?> getAvailableTeamsToJoin(Authentication authentication) {
        System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/available-teams");
        try {
            String email = authentication.getName();
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() : null;

            if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }

            return ResponseEntity.ok(coordinatorService.getAvailableTeamsToJoin(departmentId));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/faculty-projects/{facultyId}")
    public ResponseEntity<?> getFacultyProjects(@PathVariable Long facultyId, Authentication authentication) {
        System.out.println("[FacultyCoordinatorController] 📋 GET /api/coordinator/faculty-projects/" + facultyId);
        try {
            return ResponseEntity.ok(coordinatorService.getFacultyProjects(facultyId));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/allocate-team")
    public ResponseEntity<?> allocateTeamToFacultyProject(@RequestBody AllocateTeamRequest request) {
        System.out.println("[FacultyCoordinatorController] 📌 POST /api/coordinator/allocate-team");
        try {
            coordinatorService.allocateTeamToFacultyProject(request);
            return ResponseEntity.ok(Map.of("message", "Team allocated successfully"));
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/create-team")
    public ResponseEntity<?> createTeam(@RequestBody CreateTeamRequest request,Authentication authentication) {
        System.out.println("[FacultyCoordinatorController] 🆕 POST /api/coordinator/create-team");
        try {
            String email = authentication.getName();
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() : null;

            if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }

            CoordinatorTeamDetailDTO newTeam = coordinatorService.createTeamForStudent(request, departmentId);
            return ResponseEntity.ok(newTeam);
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/join-team")
    public ResponseEntity<?> joinTeam(@RequestBody JoinTeamRequest request,Authentication authentication) {
        System.out.println("[FacultyCoordinatorController] 👥 POST /api/coordinator/join-team");
        try {
                String email = authentication.getName();
            Faculty faculty = facultyRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Faculty not found"));

            Long departmentId = faculty.getDepartment() != null 
                ? faculty.getDepartment().getDepartmentId() : null;

            if(departmentId == null) {
                return ResponseEntity.status(400).body(null);
            }
            CoordinatorTeamDetailDTO updatedTeam = coordinatorService.joinTeam(request, departmentId);
            return ResponseEntity.ok(updatedTeam);
        } catch (Exception e) {
            System.out.println("[FacultyCoordinatorController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(400).body(Map.of("error", e.getMessage()));
        }
    }
}