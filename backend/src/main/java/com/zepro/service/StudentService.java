package com.zepro.service;

import com.zepro.dto.student.*;
import com.zepro.model.Meeting;
import com.zepro.model.Project;
import com.zepro.model.ProjectRequest;
import com.zepro.model.Student;
import com.zepro.model.Team;
import com.zepro.model.Users;
import com.zepro.model.Institute;
import com.zepro.model.Department;
import com.zepro.model.RequestStatus;
import com.zepro.repository.StudentRepository;
import com.zepro.repository.TeamRepository;
import com.zepro.repository.TeamJoinRequestRepository;
import com.zepro.repository.ProjectRequestRepository;
import com.zepro.repository.MeetingRepository;
import com.zepro.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import com.zepro.model.TeamJoinRequest;
import java.util.ArrayList;
import java.util.List;
import jakarta.transaction.Transactional;
import com.zepro.repository.InstituteRepository;
import com.zepro.repository.DepartmentRepository;
import com.zepro.repository.UserRepository;
import com.zepro.repository.AllocationRulesRepository;
import com.zepro.model.DeactivatedTeamJoinRequest;
import com.zepro.repository.DeactivatedTeamJoinRequestRepository;
import org.springframework.transaction.annotation.Propagation;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TeamRepository teamRepository;
    private final TeamJoinRequestRepository joinRequestRepository;
    private final ProjectRequestRepository projectRequestRepository;
    private final MeetingRepository meetingRepository;
    private final ProjectRepository projectRepository;
    private final com.zepro.repository.ProjectDomainRepository projectDomainRepository;
    private final com.zepro.repository.ProjectSubDomainRepository projectSubDomainRepository;
    private final com.zepro.repository.AllocationRulesRepository allocationRulesRepository;
    private final InstituteRepository instituteRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final DeactivatedTeamJoinRequestRepository deactivatedTeamJoinRequestRepository;
    private final com.zepro.repository.DepartmentDeadlinesRepository departmentDeadlinesRepository;
    private final FileUploadService fileUploadService;

    public StudentService(StudentRepository studentRepository,
            TeamRepository teamRepository,
            TeamJoinRequestRepository joinRequestRepository,
            ProjectRequestRepository projectRequestRepository,
            MeetingRepository meetingRepository,
            ProjectRepository projectRepository,
            com.zepro.repository.ProjectDomainRepository projectDomainRepository,
            com.zepro.repository.ProjectSubDomainRepository projectSubDomainRepository,
            com.zepro.repository.AllocationRulesRepository allocationRulesRepository,
            InstituteRepository instituteRepository,
            DepartmentRepository departmentRepository,
            UserRepository userRepository,
            DeactivatedTeamJoinRequestRepository deactivatedTeamJoinRequestRepository,
            com.zepro.repository.DepartmentDeadlinesRepository departmentDeadlinesRepository,
            FileUploadService fileUploadService) {
        this.studentRepository = studentRepository;
        this.teamRepository = teamRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.projectRequestRepository = projectRequestRepository;
        this.meetingRepository = meetingRepository;
        this.projectRepository = projectRepository;
        this.projectDomainRepository = projectDomainRepository;
        this.projectSubDomainRepository = projectSubDomainRepository;
        this.allocationRulesRepository = allocationRulesRepository;
        this.instituteRepository = instituteRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.deactivatedTeamJoinRequestRepository = deactivatedTeamJoinRequestRepository;
        this.departmentDeadlinesRepository = departmentDeadlinesRepository;
        this.fileUploadService = fileUploadService;
    }

    // ------------------------------------------------
    // DEADLINE CHECKER
    // ------------------------------------------------

    private void checkTeamFormationDeadline(Long departmentId) {
        if (departmentId == null)
            return;

        departmentDeadlinesRepository.findByDepartment_DepartmentId(departmentId)
                .ifPresent(deadlines -> {
                    if (deadlines.getTeamFormationDeadline() != null &&
                            java.time.LocalDateTime.now().isAfter(deadlines.getTeamFormationDeadline())) {
                        throw new RuntimeException("The deadline for team formations has passed in your department.");
                    }
                });
    }

    private void checkProjectRequestDeadline(Long departmentId) {
        if (departmentId == null)
            return;

        departmentDeadlinesRepository.findByDepartment_DepartmentId(departmentId)
                .ifPresent(deadlines -> {
                    if (deadlines.getTeamFormationDeadline() != null &&
                            java.time.LocalDateTime.now().isBefore(deadlines.getTeamFormationDeadline())) {
                        throw new RuntimeException(
                                "Project requests can only be sent after the team formation deadline has passed.");
                    }
                });
    }

    // ------------------------------------------------
    // CREATE TEAM
    // ------------------------------------------------

    public TeamResponse createTeam(CreateTeamRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // ✅ CHECK TEAM FORMATION DEADLINE
        checkTeamFormationDeadline(student.getDepartment().getDepartmentId());

        if (student.getTeam() != null) {
            throw new RuntimeException("Student already belongs to a team");
        }

        if (student.isInTeam()) {
            throw new RuntimeException("Student already in a team");
        }

        // ✅ CHECK IF PROFILE COMPLETE
        if (!isProfileComplete(student)) {
            throw new RuntimeException("Please complete your profile first");
        }

        Team team = new Team();
        team.setTeamName(request.getTeamName());
        team.setDescription(request.getDescription());
        team.setTeamLead(student);

        // ✅ SET DEPARTMENT & INSTITUTE FROM STUDENT
        team.setDepartment(student.getDepartment());
        team.setInstitute(student.getInstitute());

        teamRepository.save(team);

        student.setTeam(team);
        student.setInTeam(true);
        student.setTeamLead(true);

        studentRepository.save(student);

        deactivateOtherJoinRequests(student.getStudentId());

        TeamResponse response = new TeamResponse();
        response.setTeamId(team.getTeamId());
        response.setTeamName(team.getTeamName());
        response.setTeamLead(student.getName());

        List<String> members = new ArrayList<>();
        members.add(student.getName());

        response.setMembers(members);

        return response;
    }

    // ------------------------------------------------
    // JOIN TEAM
    // ------------------------------------------------

    public String joinTeam(JoinTeamRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // ✅ CHECK TEAM FORMATION DEADLINE
        checkTeamFormationDeadline(student.getDepartment().getDepartmentId());

        if (student.isInTeam()) {
            throw new RuntimeException("Student already in a team");
        }

        // ✅ CHECK IF PROFILE COMPLETE
        if (!isProfileComplete(student)) {
            throw new RuntimeException("Please complete your profile first");
        }

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // ✅ VALIDATE DEPARTMENT & INSTITUTE
        if (!team.getDepartment().getDepartmentId().equals(student.getDepartment().getDepartmentId())) {
            throw new RuntimeException("You are from a different department. Cannot join this team");
        }

        if (!team.getInstitute().getInstituteId().equals(student.getInstitute().getInstituteId())) {
            throw new RuntimeException("You are from a different institute. Cannot join this team");
        }

        // ✅ GET ALLOCATION RULES FOR THIS DEPARTMENT
        com.zepro.model.AllocationRules rules = getAllocationRulesForDept(
                student.getDepartment().getDepartmentId(),
                student.getInstitute().getInstituteId());

        int maxTeamSize = rules.getMaxTeamSize();
        if (team.getMembers().size() >= maxTeamSize) {
            throw new RuntimeException("Limit reached in the current team (Max: " + maxTeamSize + ")");
        }

        student.setTeam(team);
        student.setInTeam(true);
        student.setTeamLead(false);

        studentRepository.save(student);

        deactivateOtherJoinRequests(student.getStudentId());

        return "Successfully joined the team";
    }

    // ✅ GET ALL TEAMS (only same department & institute)
    public List<TeamListResponse> getAllTeams(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // ✅ Check if student profile is complete
        if (!isProfileComplete(student)) {
            throw new RuntimeException("Please complete your profile first");
        }

        // ✅ FILTER: Get only teams from same department & institute
        List<Team> teams = teamRepository.findAll().stream()
                .filter(team -> team.getDepartment() != null && team.getInstitute() != null &&
                        team.getDepartment().getDepartmentId().equals(student.getDepartment().getDepartmentId()) &&
                        team.getInstitute().getInstituteId().equals(student.getInstitute().getInstituteId()))
                .toList();

        return teams.stream()
                .map(team -> {

                    boolean alreadyRequested = joinRequestRepository
                            .existsByStudentStudentIdAndTeamTeamId(studentId, team.getTeamId());

                    List<String> members = team.getMembers()
                            .stream()
                            .map(s -> s.getUser().getName())
                            .toList();

                    return new TeamListResponse(
                            team.getTeamId(),
                            team.getTeamName(),
                            team.getDescription(),
                            team.getTeamLead().getUser().getName(),
                            members,
                            alreadyRequested);

                })
                .toList();
    }

    // ✅ GET ALL PROJECTS (filtered by faculty department & institute)
    public List<ProjectResponse> getAllProjects(String email) {

        Student student = studentRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // ✅ Check if student profile is complete
        if (!isProfileComplete(student)) {
            throw new RuntimeException("Please complete your profile first");
        }

        // ✅ GET REQUESTED PROJECTS (hide them from view)
        List<Long> requestedProjectIds = getRequestedProjects(student.getStudentId());

        List<Project> projects = projectRepository.findAll();
        int teamMemberSize = (student.getTeam() != null && student.getTeam().getMembers() != null)
                ? student.getTeam().getMembers().size()
                : 0;

        return projects.stream()
                .filter(p -> {
                    // ✅ FILTER: only OPEN projects
                    if (!"OPEN".equals(p.getStatus())) {
                        return false;
                    }
                    // ✅ FILTER: only active projects
                    if (!p.getIsActive()) {
                        return false;
                    }
                    // ✅ FILTER: slots > team member size
                    int availableSlots = p.getStudentSlots() -
                            (p.getTeam() != null && p.getTeam().getMembers() != null
                                    ? p.getTeam().getMembers().size()
                                    : 0);
                    if (availableSlots < teamMemberSize) {
                        return false;
                    }

                    // ✅ HIDE REQUESTED PROJECTS
                    if (requestedProjectIds.contains(p.getProjectId())) {
                        return false;
                    }

                    // ✅ FILTER: Faculty must be from same department
                    if (p.getFaculty() == null || p.getFaculty().getDepartment() == null) {
                        return false;
                    }

                    if (!p.getFaculty().getDepartment().getDepartmentId()
                            .equals(student.getDepartment().getDepartmentId())) {
                        return false;
                    }

                    // ✅ FILTER: Faculty must be from same institute
                    // FIX: Use getInstituteId() instead of getInstitute()
                    if (p.getFaculty().getInstitute() == null) {
                        return false;
                    }

                    if (!p.getFaculty().getInstitute().getInstituteId()
                            .equals(student.getInstitute().getInstituteId())) {
                        return false;
                    }

                    return true;
                })
                .map(project -> {
                    String domainStr = "";
                    String subdomainStr = "";

                    var pDomains = projectDomainRepository
                            .findByProjectProjectId(project.getProjectId());
                    if (!pDomains.isEmpty() && pDomains.get(0).getDomain() != null) {
                        domainStr = pDomains.get(0).getDomain().getName();
                    }

                    var pSubDomains = projectSubDomainRepository
                            .findByProjectProjectId(project.getProjectId());
                    if (!pSubDomains.isEmpty() && pSubDomains.get(0).getSubDomain() != null) {
                        subdomainStr = pSubDomains.get(0).getSubDomain().getName();
                    }

                    // ✅ GET ALLOCATION RULES FOR THIS DEPARTMENT
                    com.zepro.model.AllocationRules rules = getAllocationRulesForDept(
                            student.getDepartment().getDepartmentId(),
                            student.getInstitute().getInstituteId());

                    int maxTeamSize = rules.getMaxTeamSize();
                    int projectAssigned = (project.getTeam() != null && project.getTeam().getMembers() != null)
                            ? project.getTeam().getMembers().size()
                            : 0;
                    int maxSlots = project.getStudentSlots();
                    int remainingSlots = Math.max(0, maxSlots - projectAssigned);

                    String facultyName = (project.getFaculty() != null && project.getFaculty().getUser() != null)
                            ? project.getFaculty().getUser().getName()
                            : "N/A";

                    Long facultyId = (project.getFaculty() != null)
                            ? project.getFaculty().getFacultyId()
                            : null;

                    return new ProjectResponse(
                            project.getProjectId(),
                            project.getTitle(),
                            project.getDescription(),
                            project.getStatus(),
                            domainStr,
                            subdomainStr,
                            project.getIsActive(),
                            projectAssigned,
                            maxSlots,
                            remainingSlots,
                            facultyName,
                            facultyId);
                })
                .toList();
    }
    // ------------------------------------------------
    // REQUEST PROJECT
    // ------------------------------------------------

    public String requestProject(ProjectRequestDTO request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // ✅ CHECK PROJECT REQUEST DEADLINE (Reverse check: only after team formation
        // deadline)
        checkProjectRequestDeadline(student.getDepartment().getDepartmentId());

        if (!student.isTeamLead()) {
            throw new RuntimeException("Only team lead can send project request");
        }

        Team team = student.getTeam();

        Project allocatedProject = projectRepository.findByTeam(team);
        if (allocatedProject != null) {
            throw new RuntimeException("Your team is already assigned to a project");
        }

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // ✅ VALIDATE FACULTY DEPARTMENT & INSTITUTE
        if (project.getFaculty() == null || project.getFaculty().getDepartment() == null) {
            throw new RuntimeException("Faculty not assigned to this project");
        }

        if (!project.getFaculty().getDepartment().getDepartmentId()
                .equals(student.getDepartment().getDepartmentId())) {
            throw new RuntimeException("Faculty is from a different department");
        }

        if (!project.getFaculty().getInstitute().getInstituteId()
                .equals(student.getInstitute().getInstituteId())) {
            throw new RuntimeException("Faculty is from a different institute");
        }

        boolean alreadyRequested = projectRequestRepository.existsByTeamTeamIdAndProjectProjectId(
                team.getTeamId(),
                project.getProjectId());

        if (alreadyRequested) {
            throw new RuntimeException("Your team already requested this project");
        }

        // ✅ BUILD INDIVIDUAL ARRAYS FROM DTO OR FROM TEAM MEMBERS
        List<ProjectRequestDTO.TeamMemberDTO> teamMembersFromDTO = request.getTeamMembers();
        List<Student> teamMembers = team.getMembers();

        StringBuilder names = new StringBuilder("[");
        StringBuilder rollNumbers = new StringBuilder("[");
        StringBuilder cgpas = new StringBuilder("[");
        StringBuilder resumeLinks = new StringBuilder("[");
        StringBuilder markSheetLinks = new StringBuilder("[");

        List<?> membersToProcess = (teamMembersFromDTO != null && !teamMembersFromDTO.isEmpty())
                ? teamMembersFromDTO
                : teamMembers;

        for (int i = 0; i < membersToProcess.size(); i++) {
            String name = "";
            String rollNumber = "";
            Double cgpa = 0.0;
            String resumeLink = "";
            String makeSheetLink = "";

            if (membersToProcess.get(i) instanceof ProjectRequestDTO.TeamMemberDTO) {
                ProjectRequestDTO.TeamMemberDTO member = (ProjectRequestDTO.TeamMemberDTO) membersToProcess.get(i);
                name = member.getName() != null ? member.getName() : "";
                rollNumber = member.getRollNumber() != null ? member.getRollNumber() : "";
                cgpa = member.getCgpa() != null ? member.getCgpa() : 0.0;
                resumeLink = member.getResumeLink() != null ? member.getResumeLink() : "";
                makeSheetLink = member.getMakeSheetLink() != null ? member.getMakeSheetLink() : "";
            } else if (membersToProcess.get(i) instanceof Student) {
                Student member = (Student) membersToProcess.get(i);
                name = member.getName() != null ? member.getName() : "";
                rollNumber = member.getRollNumber() != null ? member.getRollNumber() : "";
                cgpa = member.getCgpa() != 0.0 ? member.getCgpa() : 0.0;
                resumeLink = member.getResumeLink() != null ? member.getResumeLink() : "";
                makeSheetLink = member.getMarksheetLink() != null ? member.getMarksheetLink() : "";
            }

            names.append("\"").append(name).append("\"");
            rollNumbers.append("\"").append(rollNumber).append("\"");
            cgpas.append(cgpa);
            resumeLinks.append("\"").append(resumeLink).append("\"");
            markSheetLinks.append("\"").append(makeSheetLink).append("\"");

            if (i < membersToProcess.size() - 1) {
                names.append(",");
                rollNumbers.append(",");
                cgpas.append(",");
                resumeLinks.append(",");
                markSheetLinks.append(",");
            }
        }

        names.append("]");
        rollNumbers.append("]");
        cgpas.append("]");
        resumeLinks.append("]");
        markSheetLinks.append("]");

        ProjectRequest req = new ProjectRequest();
        req.setTeam(team);
        req.setProject(project);
        req.setFaculty(project.getFaculty());
        req.setStatus(RequestStatus.PENDING);

        req.setTeamMembersNames(names.toString());
        req.setTeamMembersRollNumbers(rollNumbers.toString());
        req.setTeamMembersCgpas(cgpas.toString());
        req.setTeamMembersResumeLinks(resumeLinks.toString());
        req.setTeamMembersMarkSheetLinks(markSheetLinks.toString());

        projectRequestRepository.save(req);

        System.out.println(
                "[StudentService] ✅ Project request sent to faculty: " + project.getFaculty().getUser().getName());

        return "Project request sent";
    }

    public List<Long> getRequestedProjects(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow();

        Team team = student.getTeam();

        if (team == null) {
            return List.of();
        }

        List<ProjectRequest> requests = projectRequestRepository.findByTeamTeamId(team.getTeamId());

        return requests.stream()
                .map(req -> req.getProject().getProjectId())
                .toList();
    }

    public List<ProjectRequestHistoryResponse> getProjectRequestsHistory(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Only team lead can view sent requests
        if (!student.isTeamLead()) {
            throw new RuntimeException("Only team lead can view project requests");
        }

        Team team = student.getTeam();

        if (team == null) {
            throw new RuntimeException("Student is not in a team");
        }

        List<ProjectRequest> requests = projectRequestRepository.findByTeamTeamId(team.getTeamId());

        return requests.stream()
                .map(req -> new ProjectRequestHistoryResponse(
                        req.getRequestId(),
                        req.getProject().getTitle(),
                        req.getProject().getFaculty().getUser().getName(),
                        req.getStatus() != null ? req.getStatus().name() : null,
                        req.getRejectionReason()))
                .toList();
    }

    // ------------------------------------------------
    // GET ASSIGNED PROJECT
    // ------------------------------------------------

    public AssignedProjectResponse getAssignedProject(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Team team = student.getTeam();

        if (team == null) {
            throw new RuntimeException("Student is not in a team");
        }

        AssignedProjectResponse response = new AssignedProjectResponse();
        response.setTeamName(team.getTeamName());

        Project project = projectRepository.findById(student.getAllocatedProject().getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (project != null) {
            response.setProjectId(project.getProjectId());
            response.setTitle(project.getTitle());
            response.setProjectTitle(project.getTitle());
            response.setDescription(project.getDescription());
            response.setFacultyName(project.getFaculty().getUser().getName());
            response.setStatus(project.getStatus());
        } else {
            response.setProjectTitle("Project not assigned yet");
        }

        return response;
    }

    // ------------------------------------------------
    // PROJECT REQUEST STATUS
    // ------------------------------------------------

    public ProjectRequestStatusResponse getProjectRequestsStatus(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Team team = student.getTeam();

        if (team == null) {
            throw new RuntimeException("Student is not in a team");
        }

        List<ProjectRequest> requests = projectRequestRepository.findByTeamTeamId(team.getTeamId());

        List<UpcomingRequestResponse> upcoming = new ArrayList<>();
        List<CompletedRequestResponse> completed = new ArrayList<>();

        for (ProjectRequest req : requests) {

            Project project = req.getProject();
            String status = req.getStatus() != null ? req.getStatus().name() : "";

            System.out.println("[StudentService] 📋 Processing request: " + req.getRequestId()
                    + " | Project: " + project.getTitle()
                    + " | Project Status: " + project.getStatus()
                    + " | Request Status: " + status);

            // ✅ CHECK 1: If project is CLOSE/DEACTIVATED, mark as completed with reason
            if ("CLOSE".equals(project.getStatus())) {
                System.out.println("[StudentService] ❌ Project is CLOSED/DEACTIVATED");
                completed.add(new CompletedRequestResponse(
                        req.getRequestId(),
                        req.getProject().getTitle(),
                        req.getProject().getFaculty().getUser().getName(),
                        "PROJECT CLOSED",
                        "Faculty closed this project"));
                continue;
            }

            // ✅ CHECK 2: ACCEPTED — goes to completed
            if (status.equals("ACCEPTED")) {
                System.out.println("[StudentService] ✅ Request ACCEPTED");
                completed.add(new CompletedRequestResponse(
                        req.getRequestId(),
                        req.getProject().getTitle(),
                        req.getProject().getFaculty().getUser().getName(),
                        "ACCEPTED",
                        req.getRejectionReason()));
                continue;
            }

            // ✅ CHECK 3: REJECTED — goes to completed
            if (status.equals("REJECTED")) {
                System.out.println("[StudentService] ❌ Request REJECTED");
                completed.add(new CompletedRequestResponse(
                        req.getRequestId(),
                        req.getProject().getTitle(),
                        req.getProject().getFaculty().getUser().getName(),
                        "REJECTED",
                        req.getRejectionReason() != null ? req.getRejectionReason() : "Request rejected by faculty"));
                continue;
            }

            // ✅ CHECK 4: Check meeting for this request
            java.util.Optional<Meeting> meetingOpt = meetingRepository
                    .findByRequestRequestId(req.getRequestId());

            if (meetingOpt.isPresent()) {
                Meeting meeting = meetingOpt.get();

                System.out.println("[StudentService] 📞 Meeting found: " + meeting.getMeetingId()
                        + " | Meeting Status: " + meeting.getStatus());

                // ✅ SCHEDULED meeting → upcoming
                if (meeting.getStatus() == com.zepro.model.MeetingStatus.SCHEDULED) {
                    System.out.println("[StudentService] 📅 Meeting SCHEDULED - adding to upcoming");
                    upcoming.add(new UpcomingRequestResponse(
                            req.getRequestId(),
                            req.getProject().getTitle(),
                            req.getProject().getFaculty().getUser().getName(),
                            meeting.getMeetingTime(),
                            meeting.getLocation(),
                            meeting.getMeetingLink()));
                    continue;
                }

                // ✅ DONE meeting but no accept/reject yet → completed
                if (meeting.getStatus() == com.zepro.model.MeetingStatus.DONE) {
                    System.out.println("[StudentService] ✅ Meeting DONE - waiting for faculty decision");
                    completed.add(new CompletedRequestResponse(
                            req.getRequestId(),
                            req.getProject().getTitle(),
                            req.getProject().getFaculty().getUser().getName(),
                            "MEETING COMPLETED",
                            "Waiting for faculty decision"));
                    continue;
                }

                // ✅ CANCELLED meeting → completed
                if (meeting.getStatus() == com.zepro.model.MeetingStatus.CANCELLED) {
                    System.out.println("[StudentService] ❌ Meeting CANCELLED");
                    completed.add(new CompletedRequestResponse(
                            req.getRequestId(),
                            req.getProject().getTitle(),
                            req.getProject().getFaculty().getUser().getName(),
                            "MEETING CANCELLED",
                            "Meeting was cancelled"));
                    continue;
                }
            }

            // ✅ CHECK 5: If no meeting and status is PENDING → upcoming (waiting for
            // faculty)
            if (status.equals("PENDING")) {
                System.out.println("[StudentService] ⏳ Request PENDING - waiting for faculty");
                completed.add(new CompletedRequestResponse(
                        req.getRequestId(),
                        req.getProject().getTitle(),
                        req.getProject().getFaculty().getUser().getName(),
                        "PENDING",
                        "Waiting for faculty review"));
            }
        }

        // ✅ Sort upcoming by meetingTime ascending
        upcoming.sort((a, b) -> {
            if (a.getMeetingTime() == null || b.getMeetingTime() == null)
                return 0;
            return a.getMeetingTime().compareTo(b.getMeetingTime());
        });

        System.out.println(
                "[StudentService] 📊 Summary - Upcoming: " + upcoming.size() + " | Completed: " + completed.size());

        ProjectRequestStatusResponse response = new ProjectRequestStatusResponse();
        response.setUpcomingRequests(upcoming);
        response.setCompletedRequests(completed);

        return response;
    }

    // ------------------------------------------------
    // TEAM INFO
    // ------------------------------------------------

    public TeamInfoResponse getTeamInfo(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Team team = student.getTeam();

        if (team == null) {
            throw new RuntimeException("Student is not in a team");
        }

        TeamInfoResponse response = new TeamInfoResponse();

        response.setTeamId(team.getTeamId());
        response.setTeamName(team.getTeamName());
        response.setTeamLead(team.getTeamLead().getName());
        response.setTeamLeadId(team.getTeamLead().getStudentId());
        List<com.zepro.dto.student.TeamMemberDTO> members = new ArrayList<>();

        for (Student s : team.getMembers()) {
            members.add(new com.zepro.dto.student.TeamMemberDTO(s.getStudentId(), s.getName()));
        }

        response.setMembers(members);

        return response;
    }

    public String sendJoinRequest(Long studentId, Long teamId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // ✅ CHECK TEAM FORMATION DEADLINE
        checkTeamFormationDeadline(student.getDepartment().getDepartmentId());

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        // 🔴 prevent duplicate request
        if (student.getTeam() != null) {
            throw new RuntimeException("You are already in a team");
        }
        boolean alreadyRequested = joinRequestRepository
                .existsByStudentStudentIdAndTeamTeamId(studentId, teamId);

        if (alreadyRequested) {
            throw new RuntimeException("You have already sent a request to this team");
        }

        TeamJoinRequest request = new TeamJoinRequest();
        request.setStudent(student);
        request.setTeam(team);
        request.setStatus("PENDING");

        joinRequestRepository.save(request);

        return "Join request sent successfully";
    }

    public List<JoinRequestResponse> getTeamJoinRequests(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!student.isTeamLead()) {
            throw new RuntimeException("Only team lead can view requests");
        }

        Team team = student.getTeam();

        List<TeamJoinRequest> requests = joinRequestRepository.findByTeamTeamId(team.getTeamId());

        return requests.stream()
                .map(req -> new JoinRequestResponse(
                        req.getRequestId(),
                        req.getStudent().getStudentId(),
                        req.getStudent().getUser().getName(),
                        req.getStatus(),
                        req.getRejectionReason()))
                .toList();
    }

    @Transactional
    public String approveJoinRequest(Long requestId) {

        TeamJoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Student student = request.getStudent();
        Team team = request.getTeam();

        // ✅ CHECK TEAM FORMATION DEADLINE
        checkTeamFormationDeadline(student.getDepartment().getDepartmentId());

        if (student.getTeam() != null) {
            throw new RuntimeException("Student already belongs to a team");
        }

        // ✅ VALIDATE DEPARTMENT
        if (!team.getDepartment().getDepartmentId().equals(student.getDepartment().getDepartmentId())) {
            request.setStatus("REJECTED");
            request.setRejectionReason("You are from a different department");
            joinRequestRepository.save(request);
            throw new RuntimeException("You are from a different department");
        }

        // ✅ VALIDATE INSTITUTE
        if (!team.getInstitute().getInstituteId().equals(student.getInstitute().getInstituteId())) {
            request.setStatus("REJECTED");
            request.setRejectionReason("You are from a different institute");
            joinRequestRepository.save(request);
            throw new RuntimeException("You are from a different institute");
        }

        // ✅ GET ALLOCATION RULES FOR THIS DEPARTMENT
        com.zepro.model.AllocationRules rules = getAllocationRulesForDept(
                team.getDepartment().getDepartmentId(),
                team.getInstitute().getInstituteId());

        int maxTeamSize = rules.getMaxTeamSize();
        if (team.getMembers().size() >= maxTeamSize) {
            throw new RuntimeException("Limit reached in the current team (Max: " + maxTeamSize + ")");
        }

        // add student
        student.setTeam(team);
        student.setInTeam(true);
        student.setTeamLead(false);

        team.getMembers().add(student);

        studentRepository.save(student);
        teamRepository.save(team);

        request.setStatus("APPROVED");
        joinRequestRepository.save(request);

        deactivateOtherJoinRequests(student.getStudentId());

        return "Student added to team successfully";
    }

    public String rejectJoinRequest(Long requestId, String reason) {

        TeamJoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus("REJECTED");
        request.setRejectionReason(reason != null ? reason : "");
        joinRequestRepository.save(request);

        return "Request rejected";
    }

    private void deactivateOtherJoinRequests(Long studentId) {
        List<TeamJoinRequest> pendingRequests = joinRequestRepository.findByStudentStudentIdAndStatus(studentId,
                "PENDING");
        for (TeamJoinRequest req : pendingRequests) {
            String previousStatus = req.getStatus();
            req.setStatus("REJECTED");
            req.setRejectionReason("Only one team is allowed");
            joinRequestRepository.save(req);

            DeactivatedTeamJoinRequest deact = new DeactivatedTeamJoinRequest();
            deact.setTeamJoinRequest(req);
            deact.setPreviousStatus(previousStatus);
            deact.setPresentStatus("REJECTED");
            deact.setDeactivationReason("Only one team is allowed");
            deact.setDeactivationDate(java.time.LocalDateTime.now());
            deactivatedTeamJoinRequestRepository.save(deact);
        }
    }

    private void reopenDeactivatedRequests(Long studentId) {
        List<DeactivatedTeamJoinRequest> deactivatedRequests = deactivatedTeamJoinRequestRepository
                .findByTeamJoinRequestStudentStudentId(studentId);
        for (DeactivatedTeamJoinRequest deact : deactivatedRequests) {
            TeamJoinRequest req = deact.getTeamJoinRequest();
            req.setStatus(deact.getPreviousStatus());
            req.setRejectionReason(null);
            joinRequestRepository.save(req);
            deactivatedTeamJoinRequestRepository.delete(deact);
        }
    }

    @Transactional
    public String leaveTeam(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Team team = student.getTeam();
        if (team == null) {
            throw new RuntimeException("Student is not in a team");
        }

        if (student.isTeamLead()) {
            if (team.getMembers().size() > 1) {
                throw new RuntimeException(
                        "As Team Lead, you must transfer the role to another student before leaving the team.");
            } else {
                // Team Lead is the only member
                team.setTeamLead(null);
                teamRepository.save(team);
                teamRepository.delete(team);
            }
        }

        student.setTeam(null);
        student.setInTeam(false);
        student.setTeamLead(false);

        // Also update TeamJoinRequest status back from APPROVED to null or delete it?
        // Wait,
        // the requested feature is just "reopen deactivated requests".
        // If they leave, the APPROVED request remains historically APPROVED or can be
        // ignored.

        studentRepository.save(student);

        reopenDeactivatedRequests(studentId);

        return "Successfully left the team";
    }

    @Transactional
    public String transferTeamLead(Long teamId, Long currentLeadId, Long newLeadId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getTeamLead().getStudentId().equals(currentLeadId)) {
            throw new RuntimeException("You are not the current team lead");
        }

        Student currentLead = studentRepository.findById(currentLeadId)
                .orElseThrow(() -> new RuntimeException("Current lead not found"));
        Student newLead = studentRepository.findById(newLeadId)
                .orElseThrow(() -> new RuntimeException("New lead not found"));

        if (newLead.getTeam() == null || !newLead.getTeam().getTeamId().equals(teamId)) {
            throw new RuntimeException("New lead is not a member of this team");
        }

        currentLead.setTeamLead(false);
        newLead.setTeamLead(true);
        team.setTeamLead(newLead);

        studentRepository.save(currentLead);
        studentRepository.save(newLead);
        teamRepository.save(team);

        return "Team lead role transferred successfully";
    }

    // ✅ GET ALLOCATION RULES FOR DEPARTMENT & INSTITUTE
    private com.zepro.model.AllocationRules getAllocationRulesForDept(Long departmentId, Long instituteId) {
        return allocationRulesRepository
                .findByDepartment_DepartmentIdAndInstitute_InstituteId(departmentId, instituteId)
                .orElse(allocationRulesRepository.findById(1L)
                        .orElse(new com.zepro.model.AllocationRules()));
    }

    public List<SentRequestResponse> getSentRequests(Long studentId) {

        List<TeamJoinRequest> requests = joinRequestRepository.findByStudentStudentId(studentId);

        return requests.stream()
                .map(req -> new SentRequestResponse(
                        req.getRequestId(),
                        req.getTeam().getTeamName(),
                        req.getTeam().getTeamLead().getUser().getName(),
                        req.getStatus(),
                        req.getRejectionReason()))
                .toList();
    }

    public MeetingDetailsResponse getMeetingDetails(Long requestId) {

        ProjectRequest request = projectRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Meeting meeting = meetingRepository
                .findByRequestRequestId(requestId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        Project project = request.getProject();
        Team team = request.getTeam();

        MeetingDetailsResponse response = new MeetingDetailsResponse();

        response.setTitle(meeting.getTitle());
        response.setFaculty(project.getFaculty().getUser().getName());
        response.setProjectName(project.getTitle());

        response.setLocation(meeting.getLocation());

        response.setDate(meeting.getMeetingTime().toLocalDate().toString());
        response.setTime(meeting.getMeetingTime().toLocalTime().toString());

        // Fetch domain
        String domainStr = "";
        var pDomains = projectDomainRepository.findByProjectProjectId(project.getProjectId());
        if (!pDomains.isEmpty() && pDomains.get(0).getDomain() != null) {
            domainStr = pDomains.get(0).getDomain().getName();
        }

        // Fetch subdomain
        String subdomainStr = "";
        var pSubDomains = projectSubDomainRepository.findByProjectProjectId(project.getProjectId());
        if (!pSubDomains.isEmpty() && pSubDomains.get(0).getSubDomain() != null) {
            subdomainStr = pSubDomains.get(0).getSubDomain().getName();
        }

        response.setDomain(domainStr);
        response.setSubDomain(subdomainStr);

        List<String> members = team.getMembers()
                .stream()
                .map(s -> s.getUser().getName())
                .toList();

        response.setMembers(members);

        return response;
    }

    // ------------------------------------------------
    // GET TEAM PROJECT REQUESTS FOR ANY TEAM MEMBER
    // ------------------------------------------------
    public List<TeamProjectRequestResponse> getTeamProjectRequests(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Team team = student.getTeam();

        if (team == null) {
            throw new RuntimeException("Student is not in a team");
        }

        List<ProjectRequest> requests = projectRequestRepository.findByTeamTeamId(team.getTeamId());

        return requests.stream()
                .map(req -> new TeamProjectRequestResponse(
                        req.getRequestId(),
                        req.getProject().getTitle(),
                        req.getProject().getFaculty().getUser().getName(),
                        req.getStatus() != null ? req.getStatus().name() : null,
                        req.getRejectionReason()))
                .toList();
    }

    // ✅ COMPLETE STUDENT PROFILE - FIXED
    @Transactional
    public StudentProfileResponse completeStudentProfile(Long studentId, CompleteStudentProfileRequest request) {

        System.out.println("\n╔════════════════════════════════════════╗");
        System.out.println("║    COMPLETING STUDENT PROFILE          ║");
        System.out.println("╚════════════════════════════════════════╝");
        System.out.println("[StudentService] 📝 Student ID: " + studentId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        validateProfileRequest(request);

        // ✅ SET INSTITUTE
        if (request.getInstituteId() != null) {
            Institute institute = instituteRepository.findById(request.getInstituteId())
                    .orElseThrow(() -> new RuntimeException("Institute not found"));
            student.setInstitute(institute);
            System.out.println("[StudentService] 🏢 Institute set: " + institute.getInstituteName());
        } else {
            throw new RuntimeException("Institute ID is required");
        }

        // ✅ SET DEPARTMENT
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            student.setDepartment(department);
            System.out.println("[StudentService] 🏛️  Department set: " + department.getDepartmentName());
        } else {
            throw new RuntimeException("Department ID is required");
        }

        // ✅ SET STUDENT FIELDS
        student.setRollNumber(request.getRollNumber().trim());
        System.out.println("[StudentService] 📝 Roll Number set: " + student.getRollNumber());

        double cgpaValue = request.getCgpa().doubleValue();
        student.setCgpa(cgpaValue);
        System.out.println("[StudentService] 📊 CGPA set: " + cgpaValue);

        student.setYear(request.getYear());
        System.out.println("[StudentService] 📅 Year set: " + student.getYear());

        try {
            if (request.getResumeFile() != null && !request.getResumeFile().isEmpty()) {
                String resumePath = fileUploadService.saveFile("resumes", request.getResumeFile());
                student.setResumeLink(resumePath);
                System.out.println("[StudentService] 📄 Resume File uploaded and linked: " + resumePath);
            }

            if (request.getMarksheetFile() != null && !request.getMarksheetFile().isEmpty()) {
                String marksheetPath = fileUploadService.saveFile("marksheets", request.getMarksheetFile());
                student.setMarksheetLink(marksheetPath);
                System.out.println("[StudentService] 📋 Marksheet File uploaded and linked: " + marksheetPath);
            }
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload files: " + e.getMessage());
        }

        // ✅ SET PHONE IN USERS TABLE
        Users user = student.getUser();
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        user.setPhone(request.getPhone().trim());
        System.out.println("[StudentService] 📱 Phone set: " + user.getPhone());

        // ✅ SAVE USER FIRST, THEN STUDENT
        userRepository.save(user);
        Student savedStudent = studentRepository.save(student);
        System.out.println("[StudentService] ✅ Profile saved to database");

        return new StudentProfileResponse(
                savedStudent.getStudentId(),
                savedStudent.getUser().getName(),
                savedStudent.getUser().getEmail(),
                savedStudent.getRollNumber(),
                savedStudent.getCgpa(),
                savedStudent.getYear(),
                savedStudent.getDepartment() != null ? savedStudent.getDepartment().getDepartmentId() : null,
                savedStudent.getDepartment() != null ? savedStudent.getDepartment().getDepartmentName() : null,
                savedStudent.getResumeLink(),
                savedStudent.getMarksheetLink(),
                true);
    }

    // ✅ CHECK PROFILE - matching Student.java double cgpa
    public boolean isProfileComplete(Student student) {
        if (student == null || student.getUser() == null)
            return false;

        String phone = student.getUser().getPhone();
        if (phone == null || phone.trim().isEmpty())
            return false;

        String rollNo = student.getRollNumber();
        if (rollNo == null || rollNo.trim().isEmpty())
            return false;

        // ✅ CGPA IS DOUBLE - check > 0
        double cgpa = student.getCgpa();
        if (cgpa <= 0)
            return false;

        String year = student.getYear();
        if (year == null || year.trim().isEmpty())
            return false;

        if (student.getDepartment() == null)
            return false;
        if (student.getInstitute() == null)
            return false;

        String resumeLink = student.getResumeLink();
        if (resumeLink == null || resumeLink.trim().isEmpty())
            return false;

        String marksheetLink = student.getMarksheetLink();
        if (marksheetLink == null || marksheetLink.trim().isEmpty())
            return false;

        return true;
    }

    private void validateProfileRequest(CompleteStudentProfileRequest request) {
        if (request.getRollNumber() == null || request.getRollNumber().trim().isEmpty())
            throw new RuntimeException("Roll number is required");
        if (request.getCgpa() == null || request.getCgpa() <= 0)
            throw new RuntimeException("Valid CGPA is required");
        if (request.getYear() == null || request.getYear().trim().isEmpty())
            throw new RuntimeException("Year is required");
        if (request.getPhone() == null || request.getPhone().trim().isEmpty())
            throw new RuntimeException("Phone is required");

        if (request.getResumeFile() == null || request.getResumeFile().isEmpty())
            throw new RuntimeException("Resume file is required");
        if (request.getMarksheetFile() == null || request.getMarksheetFile().isEmpty())
            throw new RuntimeException("Marksheet file is required");
    }

    // ✅ GET PROFILE STATUS (for login verification)
    public StudentProfileResponse getProfileStatus(Long studentId) {
        System.out.println("\n[StudentService] 🔍 Getting profile status for Student ID: " + studentId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        boolean isComplete = isProfileComplete(student);

        return new StudentProfileResponse(
                student.getStudentId(),
                student.getUser() != null ? student.getUser().getName() : "",
                student.getUser() != null ? student.getUser().getEmail() : "",
                student.getRollNumber(),
                student.getCgpa(),
                student.getYear(),
                student.getDepartment() != null ? student.getDepartment().getDepartmentId() : null,
                student.getDepartment() != null ? student.getDepartment().getDepartmentName() : null,
                student.getResumeLink(),
                student.getMarksheetLink(),
                isComplete);
    }

    // ✅ GET ALL INSTITUTES
    public List<InstituteDTO> getAllInstitutes() {
        System.out.println("\n[StudentService] 📡 Fetching all institutes...");

        try {
            List<Institute> institutes = instituteRepository.findAll();
            System.out.println("[StudentService] ✅ Found " + institutes.size() + " institutes");

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
            System.out.println("[StudentService] ❌ Error fetching institutes: " + e.getMessage());
            throw new RuntimeException("Failed to fetch institutes");
        }
    }

    // ✅ GET DEPARTMENTS BY INSTITUTE
    public List<DepartmentDTO> getDepartmentsByInstitute(Long instituteId) {
        System.out.println("\n[StudentService] 📡 Fetching departments for institute ID: " + instituteId);

        try {
            Institute institute = instituteRepository.findById(instituteId)
                    .orElseThrow(() -> new RuntimeException("Institute not found with ID: " + instituteId));

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
            System.out.println("[StudentService] ❌ Error fetching departments: " + e.getMessage());
            throw new RuntimeException("Failed to fetch departments");
        }
    }

    @Transactional
    public com.zepro.model.DepartmentDeadlines getDepartmentDeadlines(Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (student.getDepartment() == null) {
            return null;
        }
        return departmentDeadlinesRepository.findByDepartment_DepartmentId(student.getDepartment().getDepartmentId())
                .orElse(null);
    }

    @Transactional
    public void assignTeamLeader(Long currentLeadId, Long newLeadId) {
        Student currentLead = studentRepository.findById(currentLeadId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Student newLead = studentRepository.findById(newLeadId)
                .orElseThrow(() -> new RuntimeException("New leader not found"));

        Team team = currentLead.getTeam();
        if (team == null) {
            throw new RuntimeException("You are not in a team.");
        }

        if (!team.getTeamLead().getStudentId().equals(currentLeadId)) {
            throw new RuntimeException("Only the current Team Leader can assign a new leader.");
        }

        if (!team.getTeamId().equals(newLead.getTeam().getTeamId())) {
            throw new RuntimeException("The new leader must be in the same team.");
        }

        // Transfer Power
        currentLead.setTeamLead(false);
        newLead.setTeamLead(true);
        team.setTeamLead(newLead);

        studentRepository.save(currentLead);
        studentRepository.save(newLead);
        teamRepository.save(team);
    }

} // ✅ CLOSING BRACE FOR CLASS