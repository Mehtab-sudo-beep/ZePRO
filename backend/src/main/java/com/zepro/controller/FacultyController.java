package com.zepro.controller;

import com.zepro.model.Project;
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
    public Project createProject(@RequestBody Project project) {
        return facultyService.createProject(project);
    }

    @GetMapping("/projects")
    public List<Project> getProjects() {
        return facultyService.getProjects();
    }

    @PostMapping("/assign-project")
    public String assignProject(
            @RequestParam Long projectId,
            @RequestParam Long teamId) {

        facultyService.assignProject(projectId, teamId);
        return "Project assigned";
    }
}   