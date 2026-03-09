package com.zepro.controller;

import com.zepro.dto.CreateProjectRequest;
import com.zepro.dto.ProjectResponse;
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

    @PostMapping("/project")
    public ProjectResponse createProject(@RequestBody CreateProjectRequest request) {
        return facultyService.createProject(request);
    }

    @GetMapping("/{facultyId}/projects")
    public List<ProjectResponse> getProjects(@PathVariable Long facultyId) {
        return facultyService.getProjects(facultyId);
    }

    @GetMapping("/pending-requests")
    public List<ProjectResponse> getPendingRequests() {
        return facultyService.getPendingRequests();
    }

    @PostMapping("/assign-project")
    public String assignProject(
            @RequestParam Long projectId,
            @RequestParam Long teamId) {

        facultyService.assignProject(projectId, teamId);
        return "Project assigned";
    }
}