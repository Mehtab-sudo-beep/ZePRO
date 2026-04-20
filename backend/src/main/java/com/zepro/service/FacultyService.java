package com.zepro.service;

import com.zepro.model.*;
import com.zepro.repository.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import com.zepro.dto.faculty.*;
import com.zepro.dto.student.DepartmentDTO;
import com.zepro.dto.student.InstituteDTO;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;
import java.time.LocalDateTime;
import com.zepro.repository.DeactivatedMeetingRepository;
import com.zepro.model.DeactivatedMeeting;
import com.zepro.model.Meeting;
import com.zepro.model.MeetingStatus;

@Service
public class FacultyService {

    private final ProjectRepository projectRepository;
    private final FacultyRepository facultyRepository;
    private final DomainRepository domainRepository;
    private final SubDomainRepository subDomainRepository;
    private final ProjectRequestRepository projectRequestRepository;
    private final ProjectDomainRepository projectDomainRepository;
    private final ProjectSubDomainRepository projectSubDomainRepository;
    private final AllocationRulesRepository allocationRulesRepository;
    private final UserRepository usersRepository;
    private final DepartmentRepository departmentRepository;
    private final InstituteRepository instituteRepository;
    private final MeetingRepository meetingRepository;
    private final DeactivatedProjectRequestRepository deactivatedProjectRequestRepository;
    private final DeactivatedMeetingRepository deactivatedMeetingRepository;
    private final NotificationService notificationService;

    public FacultyService(ProjectRepository projectRepository,
            FacultyRepository facultyRepository,
            DomainRepository domainRepository,
            SubDomainRepository subDomainRepository,
            ProjectRequestRepository projectRequestRepository,
            ProjectDomainRepository projectDomainRepository,
            ProjectSubDomainRepository projectSubDomainRepository,
            AllocationRulesRepository allocationRulesRepository,
            UserRepository usersRepository,
            DepartmentRepository departmentRepository,
            InstituteRepository instituteRepository,
            MeetingRepository meetingRepository,
            DeactivatedProjectRequestRepository deactivatedProjectRequestRepository,
            DeactivatedMeetingRepository deactivatedMeetingRepository,
            NotificationService notificationService) {

        this.projectRepository = projectRepository;
        this.facultyRepository = facultyRepository;
        this.domainRepository = domainRepository;
        this.subDomainRepository = subDomainRepository;
        this.projectRequestRepository = projectRequestRepository;
        this.projectDomainRepository = projectDomainRepository;
        this.projectSubDomainRepository = projectSubDomainRepository;
        this.allocationRulesRepository = allocationRulesRepository;
        this.usersRepository = usersRepository;
        this.departmentRepository = departmentRepository;
        this.instituteRepository = instituteRepository;
        this.meetingRepository = meetingRepository;
        this.deactivatedProjectRequestRepository = deactivatedProjectRequestRepository;
        this.deactivatedMeetingRepository = deactivatedMeetingRepository;
        this.notificationService = notificationService;
    }

    public AllocationRules getAllocationRulesForFaculty(Faculty faculty, String degree) {
        if (faculty.getDepartment() != null && degree != null) {
            Optional<AllocationRules> rulesOpt = allocationRulesRepository
                    .findByDepartment_DepartmentIdAndDegree(faculty.getDepartment().getDepartmentId(), degree);
            if (rulesOpt.isPresent()) {
                return rulesOpt.get();
            }
        }
        if (faculty.getDepartment() != null) {
            List<AllocationRules> rulesOpt = allocationRulesRepository
                    .findByDepartment_DepartmentId(faculty.getDepartment().getDepartmentId());
            if (!rulesOpt.isEmpty()) {
                return rulesOpt.get(0);
            }
        }
        return allocationRulesRepository.findByDepartmentIsNull()
                .stream().findFirst().orElseGet(() -> {
                    AllocationRules defaultRules = new AllocationRules();
                    defaultRules.setMaxTeamSize(4);
                    defaultRules.setMaxSlotsPerProject(4);
                    defaultRules.setMaxStudentsPerFaculty(20);
                    defaultRules.setMaxProjectsPerFaculty(5);
                    return defaultRules;
                });
    }

    public AllocationRules getAllocationRulesByEmail(String email, String degree) {
        Faculty faculty = facultyRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        return getAllocationRulesForFaculty(faculty, degree);
    }

    public ProjectResponse createProject(CreateProjectRequest request, Faculty faculty) {

        // ✅ GET RULES
        AllocationRules rules = getAllocationRulesForFaculty(faculty, request.getDegree());

        // ✅ VALIDATE SLOTS
        int slots = request.getStudentSlots() != null ? request.getStudentSlots() : 0;
        if (slots <= 0 || slots > rules.getMaxTeamSize()) {
            throw new RuntimeException(
                    "Student slots must be between 1 and " + rules.getMaxTeamSize());
        }

        // ✅ CHECK PROJECT LIMIT
        List<Project> openProjects = projectRepository.findByFacultyFacultyIdAndStatusAndDegree(
                faculty.getFacultyId(), "OPEN", request.getDegree());
        Project project = new Project();
        if (openProjects.size() >= rules.getMaxProjectsPerFaculty()) {

            project.setTitle(request.getTitle());
            project.setDescription(request.getDescription());
            project.setFaculty(faculty);
            project.setStudentSlots(slots); // ✅ SET SLOTS
            project.setStatus("CLOSE"); // ✅ Mark as REQUESTED
            project.setDegree(request.getDegree()); // ✅ SET DEGREE
            project.setPreviousStatus(null);
            project.setPresentStatus("CLOSE");
            project.setMaximumSlotsReachedTillNow(0);
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

            ProjectResponse response = getProjectResponse(saved, faculty);
            // ✅ SET presentSlots to the created studentSlots
            response.setPresentSlots(slots);
            return response;
        } else {

            project.setTitle(request.getTitle());
            project.setDescription(request.getDescription());
            project.setFaculty(faculty);
            project.setStudentSlots(slots); // ✅ SET SLOTS
            project.setStatus("OPEN"); // ✅ First project is OPEN
            project.setDegree(request.getDegree()); // ✅ SET DEGREE
            project.setPreviousStatus(null);
            project.setPresentStatus("OPEN");
            project.setIsActive(true);
        }

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

        ProjectResponse response = getProjectResponse(saved, faculty);
        // ✅ SET presentSlots to the created studentSlots
        response.setPresentSlots(slots);
        return response;
    }

    public ProjectResponse updateProject(Long projectId, CreateProjectRequest request, Faculty faculty) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        AllocationRules rules = getAllocationRulesForFaculty(faculty,
                request.getDegree() != null ? request.getDegree() : project.getDegree());

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
        if (request.getDegree() != null) {
            project.setDegree(request.getDegree());
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

        ProjectResponse response = getProjectResponse(saved, faculty);
        // ✅ SET presentSlots to the updated studentSlots value
        response.setPresentSlots(saved.getStudentSlots());
        return response;
    }

    public List<ProjectResponse> getProjects(Long facultyId, String degree) {

        List<Project> projects = projectRepository.findByFacultyFacultyId(facultyId);
        return projects.stream()
                .filter(p -> degree == null || degree.equals(p.getDegree()))
                .map(project -> getProjectResponse(project, facultyRepository.findById(facultyId).orElseThrow()))
                .collect(Collectors.toList());
    }

    public List<ProjectResponse> getProjectsByEmail(String email, String degree) {
        Faculty faculty = facultyRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        return getProjects(faculty.getFacultyId(), degree);
    }

    public ProjectResponse activateProject(Long projectId, Faculty faculty) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        AllocationRules rules = getAllocationRulesForFaculty(faculty, project.getDegree());

        List<Project> activeProjects = projectRepository.findByFacultyFacultyIdAndStatusInAndDegree(
                project.getFaculty().getFacultyId(),
                List.of("OPEN", "ASSIGNED", "IN_PROGRESS"),
                project.getDegree());
        
        if (activeProjects.size() >= rules.getMaxProjectsPerFaculty()) {
            throw new RuntimeException(
                    "Cannot activate this project. You have reached the maximum limit of " +
                            rules.getMaxProjectsPerFaculty() + " active projects for " + project.getDegree() + ". " +
                            "Please deactivate one project before activating another.");
        }

        // ✅ NEW: RESTORE DEACTIVATED REQUESTS WITH PREVIOUS STATUS
        List<DeactivatedProjectRequest> deactivatedRequests = deactivatedProjectRequestRepository
                .findByProjectRequestProjectProjectId(projectId);

        System.out.println("[FacultyService] 🔄 Restoring " + deactivatedRequests.size() + " deactivated requests...");

        for (DeactivatedProjectRequest deactivated : deactivatedRequests) {
            ProjectRequest request = deactivated.getProjectRequest();

            // ✅ Restore to PREVIOUS status (before deactivation)
            request.setStatus(deactivated.getPreviousStatus());
            request.setRejectionReason(null);
            projectRequestRepository.save(request);

            System.out.println("[FacultyService] ✅ Restored request: " + request.getRequestId()
                    + " to status: " + deactivated.getPreviousStatus());

            // Remove from deactivated repository
            deactivatedProjectRequestRepository.delete(deactivated);
        }

        // ✅ NEW: RESTORE DEACTIVATED MEETINGS WITH PREVIOUS STATUS
        List<DeactivatedMeeting> deactivatedMeetings = deactivatedMeetingRepository
                .findByMeetingRequestProjectProjectId(projectId);

        System.out.println("[FacultyService] 📞 Restoring " + deactivatedMeetings.size() + " deactivated meetings...");

        for (DeactivatedMeeting deactivated : deactivatedMeetings) {
            Meeting meeting = deactivated.getMeeting();

            // ✅ Restore to PREVIOUS status (SCHEDULED)
            meeting.setStatus(deactivated.getPreviousStatus());
            meetingRepository.save(meeting);

            System.out.println("[FacultyService] ✅ Restored meeting: " + meeting.getMeetingId()
                    + " to status: " + deactivated.getPreviousStatus());

            // Remove from deactivated repository
            deactivatedMeetingRepository.delete(deactivated);
        }

        project.setIsActive(true);
        project.setStatus(project.getPreviousStatus());
        Project saved = projectRepository.save(project);

        ProjectResponse response = getProjectResponse(saved, faculty);
        response.setPresentSlots(saved.getStudentSlots());

        System.out.println("[FacultyService] ✅ Project " + projectId + " activated successfully");

        return response;
    }

    public ProjectResponse deactivateProject(Long projectId, Faculty faculty) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // ✅ CANNOT CLOSE IF ASSIGNED
        if ("ASSIGNED".equals(project.getStatus())) {
            throw new RuntimeException("Cannot close an assigned project");
        }

        // ✅ NEW: Handle IN_PROGRESS projects
        if ("IN_PROGRESS".equals(project.getStatus()) || "OPEN".equals(project.getStatus())) {
            System.out.println("[FacultyService] 🚫 Deactivating IN_PROGRESS project: " + projectId);

            // 1️⃣ REJECT ALL PENDING REQUESTS & STORE IN DEACTIVATED TABLE
            List<ProjectRequest> allRequests = projectRequestRepository.findByProjectProjectId(projectId);
            String rejectionReason = "Project closed by Faculty";

            for (ProjectRequest request : allRequests) {
                if (request.getStatus() == RequestStatus.PENDING || request.getStatus() == RequestStatus.COMPLETED
                        || request.getStatus() == RequestStatus.SCHEDULED) {

                    System.out.println("[FacultyService] ❌ Rejecting PENDING request: " + request.getRequestId());

                    // ✅ Store in deactivated table with previous & present status
                    DeactivatedProjectRequest deactivated = new DeactivatedProjectRequest();
                    deactivated.setProjectRequest(request);
                    deactivated.setPreviousStatus(request.getStatus()); // ✅ PENDING
                    deactivated.setPresentStatus(RequestStatus.REJECTED); // ✅ REJECTED
                    deactivated.setDeactivationReason(rejectionReason);
                    deactivated.setDeactivationDate(LocalDateTime.now());
                    deactivatedProjectRequestRepository.save(deactivated);

                    // Reject the request
                    request.setStatus(RequestStatus.REJECTED);
                    request.setRejectionReason(rejectionReason);
                    projectRequestRepository.save(request);

                    // Notify team members
                    if (request.getTeam() != null && request.getTeam().getMembers() != null) {
                        for (Student student : request.getTeam().getMembers()) {
                            if (student.getUser() != null) {
                                notificationService.createAndSendNotification(
                                        student.getUser(),
                                        "Project Request Rejected",
                                        "Your request for project '" + project.getTitle()
                                                + "' was rejected because the project was closed by the faculty.",
                                        "TeamProjectRequests",
                                        null);
                            }
                        }
                    }
                }
            }

            // 2️⃣ HANDLE SCHEDULED REQUESTS (those with meetings)
            for (ProjectRequest request : allRequests) {
                if (request.getStatus() == RequestStatus.SCHEDULED || request.getStatus() == RequestStatus.COMPLETED) {

                    System.out.println("[FacultyService] ⏸️  Handling SCHEDULED request: " + request.getRequestId());

                    // Find associated meeting
                    java.util.Optional<Meeting> meetingOpt = meetingRepository
                            .findByRequestRequestId(request.getRequestId());

                    if (meetingOpt.isPresent()) {
                        Meeting meeting = meetingOpt.get();

                        // ✅ Store meeting in deactivated table
                        DeactivatedMeeting deactivatedMeeting = new DeactivatedMeeting();
                        deactivatedMeeting.setMeeting(meeting);
                        deactivatedMeeting.setPreviousStatus(meeting.getStatus()); // ✅ SCHEDULED
                        deactivatedMeeting.setPresentStatus(MeetingStatus.CANCELLED); // ✅ CANCELLED
                        deactivatedMeeting.setDeactivationReason(rejectionReason);
                        deactivatedMeeting.setDeactivationDate(LocalDateTime.now());
                        deactivatedMeetingRepository.save(deactivatedMeeting);

                        // Cancel the meeting
                        meeting.setStatus(MeetingStatus.CANCELLED);
                        meetingRepository.save(meeting);

                        System.out.println("[FacultyService] 📞 Meeting cancelled: " + meeting.getMeetingId());
                    }

                    // ✅ Store request in deactivated table
                    DeactivatedProjectRequest deactivated = new DeactivatedProjectRequest();
                    deactivated.setProjectRequest(request);
                    deactivated.setPreviousStatus(request.getStatus()); // ✅ SCHEDULED
                    deactivated.setPresentStatus(RequestStatus.REJECTED); // ✅ REJECTED
                    deactivated.setDeactivationReason(rejectionReason);
                    deactivated.setDeactivationDate(LocalDateTime.now());
                    deactivatedProjectRequestRepository.save(deactivated);

                    // Reject the request
                    request.setStatus(RequestStatus.REJECTED);
                    request.setRejectionReason(rejectionReason);
                    projectRequestRepository.save(request);

                    // Notify team members
                    if (request.getTeam() != null && request.getTeam().getMembers() != null) {
                        for (Student student : request.getTeam().getMembers()) {
                            if (student.getUser() != null) {
                                notificationService.createAndSendNotification(
                                        student.getUser(),
                                        "Project Request Rejected",
                                        "Your request for project '" + project.getTitle()
                                                + "' was rejected because the project was closed by the faculty.",
                                        "TeamProjectRequests",
                                        null);
                            }
                        }
                    }

                }
            }
        }
        project.setPreviousStatus(project.getStatus());
        project.setIsActive(false);
        project.setStatus("CLOSE");
        Project saved = projectRepository.save(project);

        System.out.println("[FacultyService] ✅ Project deactivated successfully: " + projectId);

        return getProjectResponse(saved, faculty);
    }

    @Transactional
    public void deleteProject(Long projectId, Faculty faculty) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getFaculty().getFacultyId().equals(faculty.getFacultyId())) {
            throw new RuntimeException("Unauthorized: You don't own this project");
        }

        if ("ASSIGNED".equalsIgnoreCase(project.getStatus())) {
            throw new RuntimeException("You cannot delete an allocated project.");
        }

        if (project.getIsActive()) {
            throw new RuntimeException("First deactivate this project and then do the delete option.");
        }

        // Clean up relations
        projectDomainRepository.deleteAll(projectDomainRepository.findByProjectProjectId(projectId));
        projectSubDomainRepository.deleteAll(projectSubDomainRepository.findByProjectProjectId(projectId));

        // Delete project requests (and their meetings)
        List<ProjectRequest> requests = projectRequestRepository.findByProjectProjectId(projectId);
        for (ProjectRequest req : requests) {
            meetingRepository.findByRequestRequestId(req.getRequestId()).ifPresent(meetingRepository::delete);
            projectRequestRepository.delete(req);
        }

        projectRepository.delete(project);
    }

    @Transactional
    public void deleteProjectDocuments(Long projectId, Faculty faculty) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getFaculty().getFacultyId().equals(faculty.getFacultyId())) {
            throw new RuntimeException("Unauthorized: You don't own this project");
        }

        project.getDocuments().clear();
        projectRepository.save(project);
    }

    private ProjectResponse getProjectResponse(Project p, Faculty faculty) {
        String domainStr = "";
        String subdomainStr = "";
        var pDomains = projectDomainRepository.findByProjectProjectId(p.getProjectId());
        if (!pDomains.isEmpty() && pDomains.get(0).getDomain() != null)
            domainStr = pDomains.get(0).getDomain().getName();
        var pSubDomains = projectSubDomainRepository.findByProjectProjectId(p.getProjectId());
        if (!pSubDomains.isEmpty() && pSubDomains.get(0).getSubDomain() != null)
            subdomainStr = pSubDomains.get(0).getSubDomain().getName();

        AllocationRules rules = getAllocationRulesForFaculty(faculty, p.getDegree());

        int projectAssigned = (p.getTeam() != null && p.getTeam().getMembers() != null)
                ? p.getTeam().getMembers().size()
                : 0;
        int maxSlots = p.getStudentSlots();
        int remainingSlots = Math.max(0, maxSlots - projectAssigned);

        return new ProjectResponse(p.getProjectId(), p.getTitle(), p.getDescription(), p.getStatus(), domainStr,
                subdomainStr, p.getIsActive(), projectAssigned, maxSlots, remainingSlots, p.getDocuments(),
                p.getDegree());
    }

    // @Transactional
    // public void assignProject(Long projectId, Long teamId) {
    // Project project = projectRepository.findById(projectId).orElseThrow();

    // if (!project.getStatus().equals("REQUESTED")) {
    // throw new RuntimeException("Project not requested yet");
    // }

    // Team team = teamRepository.findById(teamId).orElseThrow();
    // Faculty faculty = project.getFaculty();

    // // 1. Link Project to Team
    // project.setTeam(team);
    // project.setStatus("ASSIGNED");
    // projectRepository.save(project);

    // // 2. Link Team to Faculty
    // team.setFaculty(faculty);
    // teamRepository.save(team);

    // // 3. Mark all students in the team as Allocated
    // List<Student> members = team.getMembers();
    // if (members != null && !members.isEmpty()) {
    // for (Student student : members) {
    // student.setAllocated(true);
    // student.setAllocatedFaculty(faculty);
    // studentRepository.save(student);
    // }
    // // 4. Update Faculty slot counter
    // faculty.setAllocatedStudents(faculty.getAllocatedStudents() +
    // members.size());
    // facultyRepository.save(faculty);
    // }

    // // 5. Accept the request
    // ProjectRequest request = projectRequestRepository
    // .findByTeamTeamId(teamId).stream().findFirst()
    // .orElseThrow();
    // request.setStatus(RequestStatus.ACCEPTED);
    // projectRequestRepository.save(request);
    // }

    public List<ProjectResponse> getPendingRequests(Long facultyId, String degree) {

        List<ProjectRequest> requests = projectRequestRepository.findByStatusAndProjectFacultyFacultyId(
                RequestStatus.PENDING,
                facultyId);

        // ✅ FILTER: Only requests for OPEN or IN_PROGRESS projects (NOT CLOSE)
        return requests.stream()
                .filter(request -> {
                    Project project = request.getProject();
                    boolean isNotClosed = project != null &&
                            !("CLOSE".equals(project.getStatus()));

                    // ✅ FILTER: Match degree track
                    if (isNotClosed && degree != null && !degree.equals(project.getDegree())) {
                        isNotClosed = false;
                    }

                    if (!isNotClosed) {
                        System.out.println("[FacultyService] 🚫 Filtering out request for closed project: "
                                + request.getRequestId());
                    }

                    return isNotClosed;
                })
                .map(request -> {

                    ProjectResponse response = new ProjectResponse();

                    response.setRequestId(request.getRequestId());

                    Project project = request.getProject();
                    if (project != null) {
                        response.setProjectId(project.getProjectId());
                        response.setTitle(project.getTitle());
                        response.setDescription(project.getDescription());
                    }

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
                                        s.isTeamLead()))
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
        if (domain.getDepartment() != null) {
            sub.setDepartment(domain.getDepartment());
        }

        return subDomainRepository.save(sub);
    }

    public ProjectRequest cancelRequest(Long requestId) {

        ProjectRequest request = projectRequestRepository.findById(requestId).orElseThrow();

        request.setStatus(RequestStatus.CANCELLED);

        return projectRequestRepository.save(request);
    }

    // ✅ COMPLETE FACULTY PROFILE
    @Transactional
    public FacultyProfileResponse completeFacultyProfile(Long facultyId, CompleteFacultyProfileRequest request) {

        System.out.println("\n[FacultyService] 🔥 COMPLETING FACULTY PROFILE - ID: " + facultyId);

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        validateFacultyProfileRequest(request);

        // Set all fields
        faculty.setEmployeeId(request.getEmployeeId().trim());
        faculty.setDesignation(request.getDesignation().trim());
        faculty.setSpecialization(request.getSpecialization().trim());
        faculty.setExperience(request.getExperience().trim());
        faculty.setQualification(request.getQualification().trim());
        faculty.setCabinNo(request.getCabinNo().trim());
        faculty.setPhone(request.getPhone().trim());

        // Set department
        if (request.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            faculty.setDepartment(dept);
            System.out.println("[FacultyService] 📋 Department: " + dept.getDepartmentName());
        }

        // Set institute
        if (request.getInstituteId() != null) {
            Institute institute = instituteRepository.findById(request.getInstituteId())
                    .orElseThrow(() -> new RuntimeException("Institute not found"));
            faculty.setInstitute(institute);
            System.out.println("[FacultyService] 🏢 Institute: " + institute.getInstituteName());
        }

        // Set phone in users table
        Users user = faculty.getUser();
        if (user == null)
            throw new RuntimeException("User not found");
        user.setPhone(request.getPhone().trim());
        usersRepository.save(user);

        Faculty saved = facultyRepository.save(faculty);

        return new FacultyProfileResponse(
                saved.getFacultyId(),
                saved.getUser().getName(),
                saved.getUser().getEmail(),
                saved.getEmployeeId(),
                saved.getDesignation(),
                saved.getSpecialization(),
                saved.getExperience(),
                saved.getQualification(),
                saved.getCabinNo(),
                saved.getPhone(),

                saved.getDepartment() != null ? saved.getDepartment().getDepartmentId() : null,
                saved.getDepartment() != null ? saved.getDepartment().getDepartmentName() : null,
                saved.getInstitute() != null ? saved.getInstitute().getInstituteId() : null,
                saved.getInstitute() != null ? saved.getInstitute().getInstituteName() : null,
                true);
    }

    // ✅ GET FACULTY PROFILE STATUS
    public FacultyProfileResponse getFacultyProfileStatus(Long facultyId) {

        System.out.println("[FacultyService] 🔍 Getting faculty profile status - ID: " + facultyId);

        Faculty faculty = facultyRepository.findById(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        boolean isComplete = isFacultyProfileComplete(faculty);

        return new FacultyProfileResponse(
                faculty.getFacultyId(),
                faculty.getUser().getName(),
                faculty.getUser().getEmail(),
                faculty.getEmployeeId(),
                faculty.getDesignation(),
                faculty.getSpecialization(),
                faculty.getExperience(),
                faculty.getQualification(),
                faculty.getCabinNo(),
                faculty.getPhone(),

                faculty.getDepartment() != null ? faculty.getDepartment().getDepartmentId() : null,
                faculty.getDepartment() != null ? faculty.getDepartment().getDepartmentName() : null,
                faculty.getInstitute() != null ? faculty.getInstitute().getInstituteId() : null,
                faculty.getInstitute() != null ? faculty.getInstitute().getInstituteName() : null,
                isComplete);
    }

    public boolean isFacultyProfileComplete(Faculty faculty) {
        if (faculty == null || faculty.getUser() == null)
            return false;

        String phone = faculty.getPhone();
        if (phone == null || phone.trim().isEmpty())
            return false;

        String employeeId = faculty.getEmployeeId();
        if (employeeId == null || employeeId.trim().isEmpty())
            return false;

        String designation = faculty.getDesignation();
        if (designation == null || designation.trim().isEmpty())
            return false;

        String specialization = faculty.getSpecialization();
        if (specialization == null || specialization.trim().isEmpty())
            return false;

        String experience = faculty.getExperience();
        if (experience == null || experience.trim().isEmpty())
            return false;

        String qualification = faculty.getQualification();
        if (qualification == null || qualification.trim().isEmpty())
            return false;

        String cabinNo = faculty.getCabinNo();
        if (cabinNo == null || cabinNo.trim().isEmpty())
            return false;

        if (faculty.getDepartment() == null)
            return false;
        if (faculty.getInstitute() == null)
            return false;

        return true;
    }

    private void validateFacultyProfileRequest(CompleteFacultyProfileRequest request) {
        if (request.getEmployeeId() == null || request.getEmployeeId().trim().isEmpty())
            throw new RuntimeException("Employee ID is required");
        if (request.getDesignation() == null || request.getDesignation().trim().isEmpty())
            throw new RuntimeException("Designation is required");
        if (request.getSpecialization() == null || request.getSpecialization().trim().isEmpty())
            throw new RuntimeException("Specialization is required");
        if (request.getExperience() == null || request.getExperience().trim().isEmpty())
            throw new RuntimeException("Experience is required");
        if (request.getQualification() == null || request.getQualification().trim().isEmpty())
            throw new RuntimeException("Qualification is required");
        if (request.getCabinNo() == null || request.getCabinNo().trim().isEmpty())
            throw new RuntimeException("Cabin number is required");
        if (request.getPhone() == null || request.getPhone().trim().isEmpty())
            throw new RuntimeException("Phone is required");

        if (request.getDepartmentId() == null)
            throw new RuntimeException("Department ID is required");
        if (request.getInstituteId() == null)
            throw new RuntimeException("Institute ID is required");
    }

    // ✅ UPDATE MAXIMUM SLOTS REACHED
    public void updateMaximumSlotsReached(Long projectId, int teamSize) {
        Project project = projectRepository.findById(projectId).orElseThrow();

        int currentMax = project.getMaximumSlotsReachedTillNow();
        int newMax = Math.max(currentMax, teamSize);

        project.setMaximumSlotsReachedTillNow(newMax);
        projectRepository.save(project);

        System.out.println("[FacultyService] 📊 Max slots updated: " + currentMax + " -> " + newMax);
    }

    public List<InstituteDTO> getAllInstitutes(java.security.Principal principal) {
        System.out.println("\n[FacultyService] 📡 Fetching institutes based on email tail...");

        try {
            List<Institute> institutes = new ArrayList<>();
            if (principal != null) {
                String email = principal.getName();
                if (email != null && email.contains("@")) {
                    String tail = email.split("@")[1].toLowerCase();
                    List<Institute> allInstitutes = instituteRepository.findAll();

                    for (Institute inst : allInstitutes) {
                        if (inst.getTail() == null)
                            continue;
                        String instTail = inst.getTail().toLowerCase();
                        if (instTail.startsWith("@")) {
                            instTail = instTail.substring(1);
                        }

                        // Check if the email domain is the same or ends with "." + instTail
                        if (tail.equals(instTail) || tail.endsWith("." + instTail)) {
                            institutes.add(inst);
                        }
                    }
                    System.out.println("[FacultyService] 🔍 Filtering institutes by tail: " + tail);
                }
            } else {
                System.out.println("[FacultyService] ⚠️ Principal is null. Returning empty list (strict domain lock).");
                return new ArrayList<>();
            }

            if (institutes.isEmpty()) {
                System.out.println("[FacultyService] 🚫 No institutes matched the tail. Strict domain check failed.");
                return new ArrayList<>();
            }

            System.out.println("[FacultyService] ✅ Found " + institutes.size() + " matched institutes");

            List<InstituteDTO> instituteDTOs = new ArrayList<>();
            for (Institute institute : institutes) {
                InstituteDTO dto = new InstituteDTO();
                dto.setInstituteId(institute.getInstituteId());
                dto.setInstituteName(institute.getInstituteName());
                dto.setInstituteCode(institute.getInstituteCode());
                instituteDTOs.add(dto);
            }

            return instituteDTOs;
        } catch (Exception e) {
            System.out.println("[FacultyService] ❌ Error fetching institutes: " + e.getMessage());
            throw new RuntimeException("Failed to fetch institutes");
        }
    }

    // ✅ GET DEPARTMENTS BY INSTITUTE
    public List<DepartmentDTO> getDepartmentsByInstitute(Long instituteId) {
        System.out.println("\n[FacultyService] 📡 Fetching departments for institute ID: " + instituteId);

        try {
            if (!instituteRepository.existsById(instituteId)) {
                throw new RuntimeException("Institute not found with ID: " + instituteId);
            }

            List<Department> departments = departmentRepository.findByInstitute_InstituteId(instituteId);

            List<DepartmentDTO> departmentDTOs = new ArrayList<>();
            for (Department department : departments) {
                DepartmentDTO dto = new DepartmentDTO();
                dto.setDepartmentId(department.getDepartmentId());
                dto.setDepartmentName(department.getDepartmentName());
                dto.setDepartmentCode(department.getDepartmentCode());
                dto.setInstituteId(instituteId);
                departmentDTOs.add(dto);
            }

            return departmentDTOs;
        } catch (Exception e) {
            System.out.println("[FacultyService] ❌ Error fetching departments: " + e.getMessage());
            throw new RuntimeException("Failed to fetch departments");
        }
    }

}