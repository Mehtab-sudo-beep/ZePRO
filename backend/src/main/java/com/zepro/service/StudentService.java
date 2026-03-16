package com.zepro.service;

import com.zepro.dto.student.*;
import com.zepro.model.Project;
import com.zepro.model.ProjectRequest;
import com.zepro.model.Student;
import com.zepro.model.Team;
import com.zepro.repository.StudentRepository;
import com.zepro.repository.TeamRepository;
import com.zepro.repository.TeamJoinRequestRepository;
import com.zepro.repository.ProjectRequestRepository;
import com.zepro.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import com.zepro.model.TeamJoinRequest;
import java.util.ArrayList;
import java.util.List;
import jakarta.transaction.Transactional;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TeamRepository teamRepository;
    private final TeamJoinRequestRepository joinRequestRepository;
    private final ProjectRequestRepository projectRequestRepository;
private final ProjectRepository projectRepository;
    public StudentService(StudentRepository studentRepository,
                          TeamRepository teamRepository,
                          TeamJoinRequestRepository joinRequestRepository,
                          ProjectRequestRepository projectRequestRepository,
                          ProjectRepository projectRepository) {
        this.studentRepository = studentRepository;
        this.teamRepository = teamRepository;
        this.joinRequestRepository = joinRequestRepository;
        this.projectRequestRepository = projectRequestRepository;
        this.projectRepository = projectRepository; 
    }

    // ------------------------------------------------
    // CREATE TEAM
    // ------------------------------------------------

    public TeamResponse createTeam(CreateTeamRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if(student.getTeam() != null){
    throw new RuntimeException("Student already belongs to a team");
}
        if (student.isInTeam()) {
            throw new RuntimeException("Student already in a team");
        }

        Team team = new Team();
        team.setTeamName(request.getTeamName());
        team.setTeamLead(student);

        teamRepository.save(team);

        student.setTeam(team);
        student.setInTeam(true);
        student.setTeamLead(true);

        studentRepository.save(student);

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

        if (student.isInTeam()) {
            throw new RuntimeException("Student already in a team");
        }

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        student.setTeam(team);
        student.setInTeam(true);
        student.setTeamLead(false);

        studentRepository.save(student);

        return "Successfully joined the team";
    }


    public List<ProjectResponse> getAllProjects() {

    List<Project> projects = projectRepository.findAll();

    return projects.stream()
            .map(project -> new ProjectResponse(
                    project.getProjectId(),
                    project.getTitle(),
                    project.getDescription(),
                    project.getFaculty().getUser().getName(),
                    6   // default slots
            ))
            .toList();
}
    // ------------------------------------------------
    // REQUEST PROJECT
    // ------------------------------------------------

    public String requestProject(ProjectRequestDTO request) {

    Student student = studentRepository.findById(request.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found"));

    if (!student.isTeamLead()) {
        throw new RuntimeException("Only team lead can request a project");
    }

    Team team = student.getTeam();

    if (team == null) {
        throw new RuntimeException("Student is not in a team");
    }

    Project project = projectRepository.findById(request.getProjectId())
            .orElseThrow(() -> new RuntimeException("Project not found"));

    boolean alreadyRequested =
            projectRequestRepository.existsByTeamTeamIdAndProjectProjectId(
                    team.getTeamId(),
                    project.getProjectId()
            );

    if (alreadyRequested) {
        throw new RuntimeException("Project request already sent");
    }

    ProjectRequest projectRequest = new ProjectRequest();
    projectRequest.setTeam(team);
    projectRequest.setProject(project);
    projectRequest.setStatus("PENDING");

    projectRequestRepository.save(projectRequest);

    return "Project request sent successfully";
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

    List<ProjectRequest> requests =
            projectRequestRepository.findByTeamTeamId(team.getTeamId());

    return requests.stream()
            .map(req -> new ProjectRequestHistoryResponse(
                    req.getRequestId(),
                    req.getProject().getTitle(),
                    req.getProject().getFaculty().getUser().getName(),
                    req.getStatus()
            ))
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

        // Later you can fetch actual project entity
        response.setProjectTitle("Project not assigned yet");

        return response;
    }

    // ------------------------------------------------
    // PROJECT REQUEST STATUS
    // ------------------------------------------------

    public ProjectRequestStatusResponse getProjectRequestsStatus(Long studentId) {

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!student.isTeamLead()) {
            throw new RuntimeException("Only team lead can view requests");
        }

        ProjectRequestStatusResponse response = new ProjectRequestStatusResponse();

        // Later this will fetch real project requests

        response.setUpcomingRequests(new ArrayList<>());
        response.setCompletedRequests(new ArrayList<>());

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
        List<String> members = new ArrayList<>();

        for (Student s : team.getMembers()) {
            members.add(s.getName());
        }

        response.setMembers(members);

        return response;
    }
    public String sendJoinRequest(Long studentId, Long teamId) {

    Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

    Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));
    // 🔴 prevent duplicate request
    if(student.getTeam() != null){
    throw new RuntimeException("You are already in a team");
}
    boolean alreadyRequested =
            joinRequestRepository
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

    List<TeamJoinRequest> requests =
            joinRequestRepository.findByTeamTeamIdAndStatus(team.getTeamId(), "PENDING");

    return requests.stream()
            .map(req -> new JoinRequestResponse(
                    req.getRequestId(),
                    req.getStudent().getStudentId(),
                    req.getStudent().getUser().getName(),
                    req.getStatus()
            ))
            .toList();
}
@Transactional
public String approveJoinRequest(Long requestId){

    TeamJoinRequest request = joinRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));

    Student student = request.getStudent();
    Team team = request.getTeam();

    if (student.getTeam() != null) {
        throw new RuntimeException("Student already belongs to a team");
    }

    if (team.getMembers().size() >= 3) {
        throw new RuntimeException("Team is already full");
    }

    // add student
    student.setTeam(team);
    student.setInTeam(true);
    student.setTeamLead(false);

    team.getMembers().add(student);

    studentRepository.save(student);
    teamRepository.save(team);

    // delete ALL requests in one SQL
    joinRequestRepository.deleteAllByStudentId(student.getStudentId());

    return "Student added to team successfully";
}
public String rejectJoinRequest(Long requestId){

    TeamJoinRequest request = joinRequestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));

    joinRequestRepository.delete(request);

    return "Request rejected and removed";
}
public List<TeamListResponse> getAllTeams(Long studentId) {

    List<Team> teams = teamRepository.findAll();

    return teams.stream()
            .map(team -> {

                boolean alreadyRequested =
                        joinRequestRepository
                        .existsByStudentStudentIdAndTeamTeamId(studentId, team.getTeamId());

                List<String> members = team.getMembers()
                        .stream()
                        .map(s -> s.getUser().getName())
                        .toList();

                return new TeamListResponse(
                        team.getTeamId(),
                        team.getTeamName(),
                        team.getTeamLead().getUser().getName(),
                        members,
                        alreadyRequested
                );

            })
            .toList();
}
public List<SentRequestResponse> getSentRequests(Long studentId) {

    List<TeamJoinRequest> requests =
            joinRequestRepository.findByStudentStudentId(studentId);

    return requests.stream()
            .map(req -> new SentRequestResponse(
                    req.getRequestId(),
                    req.getTeam().getTeamName(),
                    req.getTeam().getTeamLead().getUser().getName(),
                    req.getStatus()
            ))
            .toList();
}
}