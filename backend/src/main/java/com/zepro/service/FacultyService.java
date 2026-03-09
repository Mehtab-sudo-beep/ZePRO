package com.zepro.service;

import com.zepro.dto.CreateProjectRequest;
import com.zepro.dto.ProjectResponse;
import com.zepro.model.Faculty;
import com.zepro.model.Project;
import com.zepro.model.Team;
import com.zepro.repository.FacultyRepository;
import com.zepro.repository.ProjectRepository;
import com.zepro.repository.TeamRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyService {

    private final ProjectRepository projectRepository;
    private final FacultyRepository facultyRepository;
    private final TeamRepository teamRepository;

    public FacultyService(ProjectRepository projectRepository,
                          FacultyRepository facultyRepository,
                          TeamRepository teamRepository) {
        this.projectRepository = projectRepository;
        this.facultyRepository = facultyRepository;
        this.teamRepository = teamRepository;
    }

    public ProjectResponse createProject(CreateProjectRequest request) {

        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow();

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
        Team team = teamRepository.findById(teamId).orElseThrow();

        project.setTeam(team);
        project.setStatus("ASSIGNED");

        projectRepository.save(project);
    }

    public List<ProjectResponse> getPendingRequests() {

        return projectRepository.findByStatus("REQUESTED")
                .stream()
                .map(p -> new ProjectResponse(
                        p.getProjectId(),
                        p.getTitle(),
                        p.getDescription(),
                        p.getStatus()))
                .collect(Collectors.toList());
    }
}