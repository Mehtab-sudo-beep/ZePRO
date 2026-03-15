package com.zepro.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.zepro.dto.faculty.AssignProjectRequest;
import com.zepro.dto.faculty.CreateProjectRequest;
import com.zepro.dto.faculty.DomainRequest;
import com.zepro.dto.faculty.ProjectResponse;
import com.zepro.dto.faculty.SubDomainRequest;
import com.zepro.model.Domain;
import com.zepro.model.Faculty;
import com.zepro.model.SubDomain;
import com.zepro.repository.FacultyRepository;
import com.zepro.service.DomainService;
import com.zepro.service.FacultyService;

@RestController
@RequestMapping("/faculty")
public class FacultyController {

    private final FacultyService facultyService;
    private final DomainService domainService;
    private final FacultyRepository facultyRepository;

    public FacultyController(FacultyService facultyService,
                             DomainService domainService,
                             FacultyRepository facultyRepository) {
        this.facultyService = facultyService;
        this.domainService = domainService;
        this.facultyRepository = facultyRepository;
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

    @GetMapping("/{facultyId}/projects")
    public List<ProjectResponse> getProjects(@PathVariable Long facultyId) {
        return facultyService.getProjects(facultyId);
    }

    @GetMapping("/pending-requests")
    public List<ProjectResponse> getPendingRequests() {
        return facultyService.getPendingRequests();
    }

    @PostMapping("/assign-project")
public String assignProject(@RequestBody AssignProjectRequest request) {

    facultyService.assignProject(
            request.getProjectId(),
            request.getTeamId()
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
}