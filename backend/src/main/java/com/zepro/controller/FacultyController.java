package com.zepro.controller;

import com.zepro.dto.faculty.CreateProjectRequest;
import com.zepro.dto.faculty.ProjectResponse;
import com.zepro.dto.faculty.ScheduleMeetingRequest;
import com.zepro.service.FacultyService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/faculty")
public class FacultyController {

    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    // Create project
    @PostMapping("/project")
    public ProjectResponse createProject(@RequestBody CreateProjectRequest request) {
        return facultyService.createProject(request);
    }

    // Faculty projects
    @GetMapping("/{facultyId}/projects")
    public List<ProjectResponse> getProjects(@PathVariable Long facultyId) {
        return facultyService.getProjects(facultyId);
    }

    // Pending requests for THIS faculty
    @GetMapping("/{facultyId}/pending-requests")
    public List<ProjectResponse> getPendingRequests(@PathVariable Long facultyId) {
        return facultyService.getPendingRequests(facultyId);
    }

    // Assign project (only if project belongs to faculty)
    @PostMapping("/{facultyId}/assign-project")
    public String assignProject(
            @PathVariable Long facultyId,
            @RequestParam Long projectId,
            @RequestParam Long teamId) {

        facultyService.assignProject(facultyId, projectId, teamId);
        return "Project assigned";
    }

    // Schedule meeting for project request
    @PostMapping("/{facultyId}/schedule-meeting")
    public String scheduleMeeting(
            @PathVariable Long facultyId,
            @RequestBody ScheduleMeetingRequest request) {

        facultyService.scheduleMeeting(facultyId, request);
        return "Meeting scheduled successfully";
    }

    // Cancel request (only for this faculty’s project)
    @DeleteMapping("/{facultyId}/cancel-request/{requestId}")
    public String cancelRequest(
            @PathVariable Long facultyId,
            @PathVariable Long requestId) {

        facultyService.cancelRequest(facultyId, requestId);
        return "Request cancelled";
    }
}