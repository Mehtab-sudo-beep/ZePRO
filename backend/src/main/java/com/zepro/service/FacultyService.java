package com.zepro.service;

import com.zepro.dto.faculty.CreateProjectRequest;
import com.zepro.dto.faculty.ProjectResponse;
import com.zepro.model.*;
import com.zepro.repository.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final ProjectRepository projectRepository;
    private final FacultyRepository facultyRepository;
    private final TeamRepository teamRepository;
    private final DomainRepository domainRepository;
    private final SubDomainRepository subDomainRepository;
    private final ProjectRequestRepository projectRequestRepository;

    public FacultyService(ProjectRepository projectRepository,
                      FacultyRepository facultyRepository,
                      TeamRepository teamRepository,
                      DomainRepository domainRepository,
                      SubDomainRepository subDomainRepository,
                      ProjectRequestRepository projectRequestRepository) {

    this.projectRepository = projectRepository;
    this.facultyRepository = facultyRepository;
    this.teamRepository = teamRepository;
    this.domainRepository = domainRepository;
    this.subDomainRepository = subDomainRepository;
    this.projectRequestRepository = projectRequestRepository;
}

    public ProjectResponse createProject(CreateProjectRequest request, 
        Faculty faculty) {

    Project project = new Project();

    project.setTitle(request.getTitle());
    project.setDescription(request.getDescription());
    project.setFaculty(faculty);
    project.setStatus("OPEN");

    Project saved = projectRepository.save(project);

    return new ProjectResponse(
            saved.getProjectId(),
            saved.getTitle(),
            saved.getDescription(),
            saved.getStatus()
    );
}
    public List<ProjectResponse> getProjects(Long facultyId) {

        return projectRepository.findByFacultyFacultyId(facultyId)
                .stream()
                .map(p -> new ProjectResponse(
                        p.getProjectId(),
                        p.getTitle(),
                        p.getDescription(),
                        p.getStatus()))
                .collect(Collectors.toList());
    }

    public void assignProject(Long projectId, Long teamId) {

    Project project = projectRepository.findById(projectId).orElseThrow();

    if(!project.getStatus().equals("REQUESTED")){
        throw new RuntimeException("Project not requested yet");
    }

    Team team = teamRepository.findById(teamId).orElseThrow();

    project.setTeam(team);
    project.setStatus("ASSIGNED");

    projectRepository.save(project);

    ProjectRequest request = projectRequestRepository
            .findByTeamTeamId(teamId)
            .orElseThrow();

    request.setStatus("APPROVED");

    projectRequestRepository.save(request);
}

    public List<ProjectResponse> getPendingRequests() {

        return projectRepository.findByStatus("REQUESTED")
                .stream()
                .map(project -> {

                    ProjectResponse response = new ProjectResponse();
                    response.setProjectId(project.getProjectId());
                    response.setTitle(project.getTitle());
                    response.setDescription(project.getDescription());
                    response.setStatus(project.getStatus());

                    Team team = project.getTeam();

                    if (team != null) {

                        response.setTeamId(team.getTeamId());
                        response.setTeamName(team.getTeamName());

                        if (team.getTeamLead() != null) {
                            response.setTeamLead(team.getTeamLead().getUser().getName());
                        }

                        List<String> members =
                                team.getMembers()
                                        .stream()
                                        .map(student -> student.getUser().getName())
                                        .toList();

                        response.setTeamMembers(members);
                    }

                    return response;
                })
                .collect(Collectors.toList());
    }

    public SubDomain createSubDomain(String name, Long domainId) {

        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new RuntimeException("Domain not found"));

        SubDomain sub = new SubDomain();
        sub.setName(name);
        sub.setDomain(domain);

        return subDomainRepository.save(sub);
    }
}