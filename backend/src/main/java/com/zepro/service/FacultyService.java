package com.zepro.service;

import com.zepro.dto.faculty.CreateProjectRequest;
import com.zepro.dto.faculty.ProjectResponse;
import com.zepro.model.*;
import com.zepro.repository.*;
import org.springframework.transaction.annotation.Transactional;

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
    private final ProjectDomainRepository projectDomainRepository;
private final ProjectSubDomainRepository projectSubDomainRepository;
private final StudentRepository studentRepository;

    public FacultyService(ProjectRepository projectRepository,
                      FacultyRepository facultyRepository,
                      TeamRepository teamRepository,
                      DomainRepository domainRepository,
                      SubDomainRepository subDomainRepository,
                      ProjectRequestRepository projectRequestRepository,
                      ProjectDomainRepository projectDomainRepository,
                      ProjectSubDomainRepository projectSubDomainRepository,
    StudentRepository studentRepository) {

    this.projectRepository = projectRepository;
    this.facultyRepository = facultyRepository;
    this.teamRepository = teamRepository;
    this.domainRepository = domainRepository;
    this.subDomainRepository = subDomainRepository;
    this.projectRequestRepository = projectRequestRepository;
    this.projectDomainRepository = projectDomainRepository;
    this.projectSubDomainRepository = projectSubDomainRepository;
    this.studentRepository = studentRepository;
}

    public ProjectResponse createProject(CreateProjectRequest request, Faculty faculty) {

    Project project = new Project();

    project.setTitle(request.getTitle());
    project.setDescription(request.getDescription());
    project.setStudentSlots(request.getStudentSlots());
    project.setFaculty(faculty);
    project.setStatus("OPEN");

    Project saved = projectRepository.save(project);

    // get domain
    Domain domain = domainRepository.findById(request.getDomainId())
            .orElseThrow(() -> new RuntimeException("Domain not found"));

    // get subdomain
    SubDomain subDomain = subDomainRepository.findById(request.getSubDomainId())
            .orElseThrow(() -> new RuntimeException("Subdomain not found"));

    // insert into project_domain table
    ProjectDomain projectDomain = new ProjectDomain();
    projectDomain.setProject(saved);
    projectDomain.setDomain(domain);
    projectDomainRepository.save(projectDomain);

    // insert into project_sub_domain table
    ProjectSubDomain projectSubDomain = new ProjectSubDomain();
    projectSubDomain.setProject(saved);
    projectSubDomain.setSubDomain(subDomain);
    projectSubDomainRepository.save(projectSubDomain);

    return new ProjectResponse(
            saved.getProjectId(),
            saved.getTitle(),
            saved.getDescription(),
            saved.getStatus(),
            domain.getName(),
            subDomain.getName(),
            saved.getIsActive()
    );
}

    public ProjectResponse updateProject(Long projectId, CreateProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        
        if (request.getStudentSlots() != null) {
            project.setStudentSlots(request.getStudentSlots());
        }
        Project saved = projectRepository.save(project);

        if (request.getDomainId() != null) {
            var existingDomains = projectDomainRepository.findByProjectProjectId(projectId);
            if (!existingDomains.isEmpty()) {
                ProjectDomain pd = existingDomains.get(0);
                pd.setDomain(domainRepository.findById(request.getDomainId()).orElseThrow());
                projectDomainRepository.save(pd);
            } else {
                ProjectDomain pd = new ProjectDomain();
                pd.setProject(saved);
                pd.setDomain(domainRepository.findById(request.getDomainId()).orElseThrow());
                projectDomainRepository.save(pd);
            }
        }

        if (request.getSubDomainId() != null) {
            var existingSubDomains = projectSubDomainRepository.findByProjectProjectId(projectId);
            if (!existingSubDomains.isEmpty()) {
                ProjectSubDomain psd = existingSubDomains.get(0);
                psd.setSubDomain(subDomainRepository.findById(request.getSubDomainId()).orElseThrow());
                projectSubDomainRepository.save(psd);
            } else {
                ProjectSubDomain psd = new ProjectSubDomain();
                psd.setProject(saved);
                psd.setSubDomain(subDomainRepository.findById(request.getSubDomainId()).orElseThrow());
                projectSubDomainRepository.save(psd);
            }
        }

        return new ProjectResponse(
                saved.getProjectId(),
                saved.getTitle(),
                saved.getDescription(),
                saved.getStatus(),
                "", "",
                saved.getIsActive()
        );
    }

    public List<ProjectResponse> getProjects(Long facultyId) {

        return projectRepository.findByFacultyFacultyId(facultyId)
                .stream()
                .map(p -> {
                    String domainStr = "";
                    String subdomainStr = "";

                    var pDomains = projectDomainRepository
                            .findByProjectProjectId(p.getProjectId());
                    if (!pDomains.isEmpty() && pDomains.get(0).getDomain() != null) {
                        domainStr = pDomains.get(0).getDomain().getName();
                    }

                    var pSubDomains = projectSubDomainRepository
                            .findByProjectProjectId(p.getProjectId());
                    if (!pSubDomains.isEmpty() && pSubDomains.get(0).getSubDomain() != null) {
                        subdomainStr = pSubDomains.get(0).getSubDomain().getName();
                    }

                    return new ProjectResponse(
                            p.getProjectId(),
                            p.getTitle(),
                            p.getDescription(),
                            p.getStatus(),
                            domainStr,
                            subdomainStr,
                            p.getIsActive());
                })
                .collect(Collectors.toList());
    }

    public ProjectResponse activateProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setIsActive(true);
        Project saved = projectRepository.save(project);
        return getProjectResponse(saved);
    }

    public ProjectResponse deactivateProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setIsActive(false);
        Project saved = projectRepository.save(project);
        return getProjectResponse(saved);
    }

    private ProjectResponse getProjectResponse(Project p) {
        String domainStr = "";
        String subdomainStr = "";
        var pDomains = projectDomainRepository.findByProjectProjectId(p.getProjectId());
        if (!pDomains.isEmpty() && pDomains.get(0).getDomain() != null) domainStr = pDomains.get(0).getDomain().getName();
        var pSubDomains = projectSubDomainRepository.findByProjectProjectId(p.getProjectId());
        if (!pSubDomains.isEmpty() && pSubDomains.get(0).getSubDomain() != null) subdomainStr = pSubDomains.get(0).getSubDomain().getName();
        return new ProjectResponse(p.getProjectId(), p.getTitle(), p.getDescription(), p.getStatus(), domainStr, subdomainStr, p.getIsActive());
    }

    @Transactional
    public void assignProject(Long projectId, Long teamId) {
        Project project = projectRepository.findById(projectId).orElseThrow();

        if(!project.getStatus().equals("REQUESTED")){
            throw new RuntimeException("Project not requested yet");
        }

        Team team = teamRepository.findById(teamId).orElseThrow();
        Faculty faculty = project.getFaculty();

        // 1. Link Project to Team
        project.setTeam(team);
        project.setStatus("ASSIGNED");
        projectRepository.save(project);

        // 2. Link Team to Faculty
        team.setFaculty(faculty);
        teamRepository.save(team);

        // 3. Mark all students in the team as Allocated
        List<Student> members = team.getMembers();
        if (members != null && !members.isEmpty()) {
            for (Student student : members) {
                student.setAllocated(true);
                student.setAllocatedFaculty(faculty);
                studentRepository.save(student);
            }
            // 4. Update Faculty slot counter
            faculty.setAllocatedStudents(faculty.getAllocatedStudents() + members.size());
            facultyRepository.save(faculty);
        }

        // 5. Accept the request
        ProjectRequest request = projectRequestRepository
                .findByTeamTeamId(teamId).stream().findFirst()
                .orElseThrow();
        request.setStatus(RequestStatus.ACCEPTED);
        projectRequestRepository.save(request);
    }

 public List<ProjectResponse> getPendingRequests(Long facultyId) {

    List<ProjectRequest> requests =
            projectRequestRepository.findByStatusAndProjectFacultyFacultyId(
                    RequestStatus.PENDING,
                    facultyId
            );

    return requests.stream().map(request -> {

        ProjectResponse response = new ProjectResponse();

        response.setRequestId(request.getRequestId());

        Team team = request.getTeam();

        if (team != null) {
            response.setTeamId(team.getTeamId());
            response.setTeamName(team.getTeamName());

            // 🔥 ADD MEMBERS
            List<String> members = team.getMembers()
                    .stream()
                    .map(s -> s.getUser().getName())
                    .toList();

            response.setMembers(members);
        }

        response.setStatus(request.getStatus().name());

        return response;

    }).toList();
}
  public SubDomain createSubDomain(String name, Long domainId) {

        Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new RuntimeException("Domain not found"));

        SubDomain sub = new SubDomain();
        sub.setName(name);
        sub.setDomain(domain);

        return subDomainRepository.save(sub);
    }

    public ProjectRequest cancelRequest(Long requestId) {

    ProjectRequest request =
            projectRequestRepository.findById(requestId).orElseThrow();

    request.setStatus(RequestStatus.CANCELLED);

    return projectRequestRepository.save(request);
}
}