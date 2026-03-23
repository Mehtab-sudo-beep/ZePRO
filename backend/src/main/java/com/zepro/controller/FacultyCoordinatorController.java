package com.zepro.controller;

import com.zepro.dto.facultycoordinator.AllTeamsReportResponse;
import com.zepro.dto.facultycoordinator.AllocateStudentRequest;
import com.zepro.dto.facultycoordinator.AllocationRulesResponse;
import com.zepro.dto.facultycoordinator.CoordinatorFacultyResponse;
import com.zepro.dto.facultycoordinator.CoordinatorStudentResponse;
import com.zepro.dto.facultycoordinator.CoordinatorTeamResponse;
import com.zepro.dto.facultycoordinator.DashboardStatsResponse;
import com.zepro.dto.facultycoordinator.OverrideAllocationRequest;
import com.zepro.dto.facultycoordinator.SaveRulesRequest;
import com.zepro.service.FacultyCoordinatorService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coordinator")
public class FacultyCoordinatorController {

    private final FacultyCoordinatorService coordinatorService;

    public FacultyCoordinatorController(FacultyCoordinatorService coordinatorService) {
        this.coordinatorService = coordinatorService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(coordinatorService.getDashboardStats());
    }

    @GetMapping("/faculties")
    public ResponseEntity<List<CoordinatorFacultyResponse>> getAllFaculties() {
        return ResponseEntity.ok(coordinatorService.getAllFaculties());
    }

    @GetMapping("/faculties/search")
    public ResponseEntity<List<CoordinatorFacultyResponse>> searchFaculties(@RequestParam String q) {
        return ResponseEntity.ok(coordinatorService.searchFaculties(q));
    }

    @GetMapping("/students")
    public ResponseEntity<List<CoordinatorStudentResponse>> getAllStudents() {
        return ResponseEntity.ok(coordinatorService.getAllStudents());
    }

    @GetMapping("/students/search")
    public ResponseEntity<List<CoordinatorStudentResponse>> searchStudents(@RequestParam String q) {
        return ResponseEntity.ok(coordinatorService.searchStudents(q));
    }

    @GetMapping("/students/allocated")
    public ResponseEntity<List<CoordinatorStudentResponse>> getAllocatedStudents() {
        return ResponseEntity.ok(coordinatorService.getAllocatedStudents()); // ← add this to service too
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
    public ResponseEntity<List<CoordinatorTeamResponse>> getAllTeams() {
        return ResponseEntity.ok(coordinatorService.getAllTeams());
    }

    @GetMapping("/teams/report")
    public ResponseEntity<AllTeamsReportResponse> getAllTeamsReport() {
        return ResponseEntity.ok(coordinatorService.getAllTeamsReport());
    }

    @GetMapping("/teams/report/pdf") // ✅ this is what the frontend calls
    public ResponseEntity<byte[]> getAllTeamsReportPdf() {
        byte[] pdf = coordinatorService.generateAllTeamsReportPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"teams_report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/rules")
    public ResponseEntity<AllocationRulesResponse> getRules() {
        return ResponseEntity.ok(coordinatorService.getRules());
    }

    @PostMapping("/rules")
    public ResponseEntity<String> saveRules(@RequestBody SaveRulesRequest request) {
        coordinatorService.saveRules(request);
        return ResponseEntity.ok("Rules updated successfully!");
    }
}