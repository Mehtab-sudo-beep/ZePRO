package com.zepro.service;

import com.zepro.dto.student.*;
import com.zepro.model.Student;
import com.zepro.model.Team;
import com.zepro.repository.StudentRepository;
import com.zepro.repository.TeamRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final TeamRepository teamRepository;

    public StudentService(StudentRepository studentRepository,
                          TeamRepository teamRepository) {
        this.studentRepository = studentRepository;
        this.teamRepository = teamRepository;
    }

    // ------------------------------------------------
    // CREATE TEAM
    // ------------------------------------------------

    public TeamResponse createTeam(CreateTeamRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

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

    // ------------------------------------------------
    // REQUEST PROJECT
    // ------------------------------------------------

    public String requestProject(ProjectRequestDTO request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!student.isTeamLead()) {
            throw new RuntimeException("Only team lead can request project");
        }

        Team team = student.getTeam();

        // Here you will later create ProjectRequest entity
        // and store it in DB

        return "Project request sent successfully for team: " + team.getTeamName();
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

        List<String> members = new ArrayList<>();

        for (Student s : team.getMembers()) {
            members.add(s.getName());
        }

        response.setMembers(members);

        return response;
    }
}