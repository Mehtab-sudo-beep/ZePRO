package com.zepro.service;
import java.util.ArrayList;
import java.util.List;

import com.zepro.dto.student.*;
import com.zepro.model.*;
import com.zepro.repository.*;

import org.springframework.stereotype.Service;
import java.util.stream.Collectors;
import com.zepro.dto.student.ProjectRequestStatusResponse;
import com.zepro.dto.student.ProjectStatusDTO;
import com.zepro.dto.student.TeamInfoResponse;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TeamRepository teamRepository;

    private final ProjectRepository projectRepository;

public StudentService(StudentRepository studentRepository,
                      TeamRepository teamRepository,
                      ProjectRepository projectRepository) {

    this.studentRepository = studentRepository;
    this.teamRepository = teamRepository;
    this.projectRepository = projectRepository;
}
    public TeamResponse createTeam(CreateTeamRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Student cannot create a team if already in one
        if(student.isInTeam()) {
            throw new RuntimeException("Student already belongs to a team");
        }

        Team team = new Team();
        team.setTeamName(request.getTeamName());
        team.setTeamLead(student);

        Team savedTeam = teamRepository.save(team);

        student.setTeam(savedTeam);
        student.setInTeam(true);
        student.setTeamLead(true);

        studentRepository.save(student);

        TeamResponse response = new TeamResponse();
        response.setTeamId(savedTeam.getTeamId());
        response.setTeamName(savedTeam.getTeamName());
        response.setTeamLead(student.getUser().getName());

        return response;
    }

    public String joinTeam(JoinTeamRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Rule 1: If already in team → cannot join another
        if(student.isInTeam()) {
            throw new RuntimeException("Student already belongs to a team");
        }

        // Rule 2: Team lead cannot join other teams
        if(student.isTeamLead()) {
            throw new RuntimeException("Team leader cannot join another team");
        }

        // Rule 3: Prevent joining the same team
        if(student.getTeam() != null && 
           student.getTeam().getTeamId().equals(team.getTeamId())) {

            throw new RuntimeException("Student already belongs to this team");
        }

        student.setTeam(team);
        student.setInTeam(true);
        student.setTeamLead(false);

        studentRepository.save(student);

        return "Joined team successfully";
    }
    public String requestProject(ProjectRequestDTO request) {
        Student student = studentRepository.findById(request.getStudentId()).orElseThrow();
        if(!student.isTeamLead()){
            throw new RuntimeException("Only team lead can request project");
        }
        Team team = student.getTeam();
        if (team == null) throw new RuntimeException("Student not in a team");

        // Prevent sending new requests if any project is already accepted for this team
        List<Project> teamProjects = projectRepository.findAllByTeam(team);
        boolean hasAccepted = teamProjects.stream().anyMatch(p -> "ACCEPTED".equals(p.getStatus()));
        if (hasAccepted) {
            throw new RuntimeException("Project already accepted for your team. Cannot request more.");
        }

        Project project = projectRepository.findById(request.getProjectId()).orElseThrow();
        if(!project.getStatus().equals("OPEN")){
            throw new RuntimeException("Project already requested or assigned");
        }

        project.setStatus("REQUESTED");
        project.setTeam(team);
        projectRepository.save(project);

        return "Project request sent to faculty";
    }
    public AssignedProjectResponse getAssignedProject(Long studentId){

        Student student = studentRepository.findById(studentId).orElseThrow();

        Team team = student.getTeam();

        if(team == null){
            throw new RuntimeException("Student not in a team");
        }

        Project project = projectRepository.findByTeam(team);

        if(project == null){
            throw new RuntimeException("No project assigned yet");
        }

        AssignedProjectResponse response = new AssignedProjectResponse();

        response.setProjectId(project.getProjectId());
        response.setTitle(project.getTitle());
        response.setDescription(project.getDescription());
        response.setFacultyName(project.getFaculty().getUser().getName());

        return response;
    }
    public ProjectRequestStatusResponse getProjectRequestsStatus(Long studentId) {
    Student student = studentRepository.findById(studentId).orElseThrow();
    if (!student.isTeamLead()) throw new RuntimeException("Only team lead can view project requests");

    Team team = student.getTeam();
    if (team == null) throw new RuntimeException("Student not in a team");

    // Fetch all projects requested by this team
    List<Project> projects = projectRepository.findAllByTeam(team);

    List<ProjectStatusDTO> upcoming = new ArrayList<>();
    List<ProjectStatusDTO> completed = new ArrayList<>();

    for (Project project : projects) {
        ProjectStatusDTO dto = new ProjectStatusDTO();
        dto.setProjectId(project.getProjectId());
        dto.setTitle(project.getTitle());
        dto.setStatus(project.getStatus());
        dto.setFacultyName(project.getFaculty() != null ? project.getFaculty().getUser().getName() : null);

        // "ACCEPTED" is considered completed and should be at the top
        if ("ACCEPTED".equals(project.getStatus())) {
            completed.add(0, dto); // add at top
        } else if ("REJECTED".equals(project.getStatus())) {
            completed.add(dto);
        } else {
            upcoming.add(dto);
        }
    }

    ProjectRequestStatusResponse response = new ProjectRequestStatusResponse();
    response.setUpcoming(upcoming);
    response.setCompleted(completed);
    return response;
}
    public TeamInfoResponse getTeamInfo(Long studentId) {
    Student student = studentRepository.findById(studentId).orElseThrow();
    Team team = student.getTeam();
    if (team == null) throw new RuntimeException("Student is not in a team");

    TeamInfoResponse resp = new TeamInfoResponse();
    resp.setTeamId(team.getTeamId());
    resp.setTeamName(team.getTeamName());
    resp.setTeamLead(team.getTeamLead().getUser().getName());
    // Collect all member names
    List<String> members = team.getMembers().stream()
        .map(s -> s.getUser().getName())
        .collect(Collectors.toList());
    resp.setMembers(members);
    return resp;
}
}