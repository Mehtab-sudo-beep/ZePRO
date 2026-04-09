package com.zepro.service;

import com.zepro.dto.faculty.CreateProjectRequest;
import com.zepro.dto.faculty.ProjectResponse;
import com.zepro.model.*;
import com.zepro.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import com.zepro.dto.faculty.TeamMemberDetailDTO;
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
    private final AllocationRulesRepository allocationRulesRepository;

    public FacultyService(ProjectRepository projectRepository,
            FacultyRepository facultyRepository,
            TeamRepository teamRepository,
            DomainRepository domainRepository,
            SubDomainRepository subDomainRepository,
            ProjectRequestRepository projectRequestRepository,
            ProjectDomainRepository projectDomainRepository,
            ProjectSubDomainRepository projectSubDomainRepository,
            StudentRepository studentRepository,
            AllocationRulesRepository allocationRulesRepository) {

        this.projectRepository = projectRepository;
        this.facultyRepository = facultyRepository;
        this.teamRepository = teamRepository;
        this.domainRepository = domainRepository;
        this.subDomainRepository = subDomainRepository;
        this.projectRequestRepository = projectRequestRepository;
        this.projectDomainRepository = projectDomainRepository;
        this.projectSubDomainRepository = projectSubDomainRepository;
        this.studentRepository = studentRepository;
        this.allocationRulesRepository = allocationRulesRepository;
    }

    public ProjectResponse createProject(CreateProjectRequest request, Faculty faculty) {

        // ✅ GET RULES
        AllocationRules rules = allocationRulesRepository.findById(1L)
                .orElse(new AllocationRules());

        // ✅ VALIDATE SLOTS
        int slots = request.getStudentSlots() != null ? request.getStudentSlots() : 0;
        if (slots <= 0 || slots > rules.getMaxTeamSize()) {
            throw new RuntimeException(
                "Student slots must be between 1 and " + rules.getMaxTeamSize());
        }

        // ✅ CHECK PROJECT LIMIT
        List<Project> openProjects = projectRepository.findByFacultyFacultyIdAndStatus(
                faculty.getFacultyId(), "OPEN");
        Project project = new Project();
        if (openProjects.size() >= rules.getMaxProjectsPerFaculty()) {
            
            project.setTitle(request.getTitle());
            project.setDescription(request.getDescription());       
            project.setFaculty(faculty);
            project.setStudentSlots(slots); // ✅ SET SLOTS
            project.setStatus("CLOSE"); // ✅ Mark as REQUESTED
            project.setIsActive(false);
            Project saved = projectRepository.save(project);
            
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

            ProjectResponse response = getProjectResponse(saved);
            // ✅ SET presentSlots to the created studentSlots
            response.setPresentSlots(slots);
            return response;
        }
        else{
        
        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());
        project.setFaculty(faculty);
        project.setStudentSlots(slots); // ✅ SET SLOTS
        project.setStatus("OPEN"); // ✅ First project is OPEN
        project.setIsActive(true);}

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

        ProjectResponse response = getProjectResponse(saved);
        // ✅ SET presentSlots to the created studentSlots
        response.setPresentSlots(slots);
        return response;
    }

    public ProjectResponse updateProject(Long projectId, CreateProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        AllocationRules rules = allocationRulesRepository.findById(1L)
                .orElse(new AllocationRules());
        
        if (request.getStudentSlots() != null) {
            int slots = request.getStudentSlots();
            if (slots <= 0 || slots > rules.getMaxTeamSize()) {
                throw new RuntimeException(
                    "Student slots must be between 1 and " + rules.getMaxTeamSize());
            }
            project.setStudentSlots(slots); // ✅ UPDATE SLOTS
        }

        project.setTitle(request.getTitle());
        project.setDescription(request.getDescription());

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

        ProjectResponse response = getProjectResponse(saved);
        // ✅ SET presentSlots to the updated studentSlots value
        response.setPresentSlots(saved.getStudentSlots());
        return response;
    }

    public List<ProjectResponse> getProjects(Long facultyId) {

        List<Project> projects = projectRepository.findByFacultyFacultyId(facultyId);
        return projects.stream()
                .map(this::getProjectResponse)
                .collect(Collectors.toList());
    }

    public List<ProjectResponse> getProjectsByEmail(String email) {
        Faculty faculty = facultyRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        return getProjects(faculty.getFacultyId());
    }

    public ProjectResponse activateProject(Long projectId) {
        
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        AllocationRules rules = allocationRulesRepository.findById(1L)
                .orElse(new AllocationRules());

        List<Project> activeProjects = projectRepository
                .findByFacultyFacultyIdAndStatus(project.getFaculty().getFacultyId(), "OPEN");

        
        if (activeProjects.size() >= rules.getMaxProjectsPerFaculty()) {
            throw new RuntimeException(
                "Cannot activate this project. You have reached the maximum limit of " +
                rules.getMaxProjectsPerFaculty() + " active projects. " +
                "Please deactivate one project before activating another.");
        }

        project.setIsActive(true);
        project.setStatus("OPEN");
        Project saved = projectRepository.save(project);

        ProjectResponse response = getProjectResponse(saved);
        response.setPresentSlots(saved.getStudentSlots());
        
        System.out.println("✅ Project " + projectId + " activated successfully");
        
        return response;
    }

    public ProjectResponse deactivateProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        
        // ✅ CANNOT CLOSE IF ASSIGNED
        if ("ASSIGNED".equals(project.getStatus())) {
            throw new RuntimeException("Cannot close an assigned project");
        }

        project.setIsActive(false);
        project.setStatus("CLOSE");
        Project saved = projectRepository.save(project);
        return getProjectResponse(saved);
    }

    private ProjectResponse getProjectResponse(Project p) {
        String domainStr = "";
        String subdomainStr = "";
        var pDomains = projectDomainRepository.findByProjectProjectId(p.getProjectId());
        if (!pDomains.isEmpty() && pDomains.get(0).getDomain() != null)
            domainStr = pDomains.get(0).getDomain().getName();
        var pSubDomains = projectSubDomainRepository.findByProjectProjectId(p.getProjectId());
        if (!pSubDomains.isEmpty() && pSubDomains.get(0).getSubDomain() != null)
            subdomainStr = pSubDomains.get(0).getSubDomain().getName();
            
        AllocationRules rules = allocationRulesRepository.findById(1L).orElse(new AllocationRules());
        int maxTeamSize = rules.getMaxTeamSize();

        int projectAssigned = (p.getTeam() != null && p.getTeam().getMembers() != null) ? p.getTeam().getMembers().size() : 0;
        int maxSlots = p.getStudentSlots();
        int remainingSlots = Math.max(0, maxSlots - projectAssigned);

        return new ProjectResponse(p.getProjectId(), p.getTitle(), p.getDescription(), p.getStatus(), domainStr,
                subdomainStr, p.getIsActive(), projectAssigned, maxSlots, remainingSlots);
    }

    @Transactional
    public void assignProject(Long projectId, Long teamId) {
        Project project = projectRepository.findById(projectId).orElseThrow();

        if (!project.getStatus().equals("REQUESTED")) {
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

        List<ProjectRequest> requests = projectRequestRepository.findByStatusAndProjectFacultyFacultyId(
                RequestStatus.PENDING,
                facultyId);

        return requests.stream().map(request -> {

            ProjectResponse response = new ProjectResponse();

            response.setRequestId(request.getRequestId());

            Team team = request.getTeam();

            if (team != null) {
                response.setTeamId(team.getTeamId());
                response.setTeamName(team.getTeamName());

                // ✅ ADD COMPLETE TEAM MEMBER DETAILS
                List<String> members = team.getMembers()
                        .stream()
                        .map(s -> s.getUser().getName())
                        .toList();

                response.setMembers(members);
                
                // ✅ NEW: Add full team member info
                List<TeamMemberDetailDTO> teamMemberDetails = team.getMembers()
                        .stream()
                        .map(s -> new TeamMemberDetailDTO(
                                s.getStudentId(),
                                s.getUser().getName(),
                                s.getRollNumber() != null ? s.getRollNumber() : "N/A",
                                s.getUser().getEmail(),
                                s.getCgpa() != 0.0 ? s.getCgpa() : 0.0,
                                s.getResumeLink() != null ? s.getResumeLink() : "N/A",
                                s.getMarksheetLink() != null ? s.getMarksheetLink() : "N/A",
                                s.isTeamLead()
                        ))
                        .toList();

                response.setTeamMemberDetails(teamMemberDetails);
                
                // ✅ NEW: Add parsed team member data from ProjectRequest
                response.setTeamMembersNames(request.getTeamMembersNames());
                response.setTeamMembersRollNumbers(request.getTeamMembersRollNumbers());
                response.setTeamMembersCgpas(request.getTeamMembersCgpas());
                response.setTeamMembersResumeLinks(request.getTeamMembersResumeLinks());
                response.setTeamMembersMarkSheetLinks(request.getTeamMembersMarkSheetLinks());
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

        ProjectRequest request = projectRequestRepository.findById(requestId).orElseThrow();

        request.setStatus(RequestStatus.CANCELLED);

        return projectRequestRepository.save(request);
    }
}