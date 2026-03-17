package com.zepro.service;

import com.zepro.dto.faculty.CreateProjectRequest;
import com.zepro.dto.faculty.PendingRequestResponse;
import com.zepro.dto.faculty.ProjectResponse;
import com.zepro.dto.faculty.ScheduleMeetingRequest;
import com.zepro.model.Faculty;
import com.zepro.model.Meeting;
import com.zepro.model.Project;
import com.zepro.model.ProjectRequest;
import com.zepro.model.Team;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import com.zepro.repository.*;;
@Service
public class FacultyService {

    private final ProjectRepository projectRepository;
    private final FacultyRepository facultyRepository;
    private final TeamRepository teamRepository;
    private final MeetingRepository meetingRepository;
    private final ProjectRequestRepository projectRequestRepository;
    public FacultyService(ProjectRepository projectRepository,
                          FacultyRepository facultyRepository,
                          TeamRepository teamRepository,MeetingRepository meetingRepository, ProjectRequestRepository projectRequestRepository) {
        this.projectRepository = projectRepository;
        this.facultyRepository = facultyRepository;
        this.teamRepository = teamRepository;
        this.meetingRepository=meetingRepository;
        this.projectRequestRepository=projectRequestRepository;
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
public void assignProject(Long facultyId, Long projectId, Long teamId) {

    Project project = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Project not found"));

    if (!project.getFaculty().getFacultyId().equals(facultyId)) {
        throw new RuntimeException("You cannot assign projects created by other faculty");
    }

    Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new RuntimeException("Team not found"));

    project.setTeam(team);
    project.setStatus("ASSIGNED");
    projectRepository.save(project);

    // get all requests for this project
    List<ProjectRequest> requests =
            projectRequestRepository.findByProjectProjectId(projectId);

    for (ProjectRequest req : requests) {

        if (req.getTeam().getTeamId().equals(teamId)) {
            req.setStatus("APPROVED");
        } else {
            req.setStatus("REJECTED");
        }

        projectRequestRepository.save(req);
    }
}
    public List<ProjectResponse> getPendingRequests(Long facultyId) {

    return projectRequestRepository
            .findByStatusAndProjectFacultyFacultyId("PENDING", facultyId)
            .stream()
            .map(req -> {

                Project project = req.getProject();
                Team team = req.getTeam();

                ProjectResponse response = new ProjectResponse();

                response.setProjectId(project.getProjectId());
                response.setTitle(project.getTitle());
                response.setDescription(project.getDescription());
                response.setStatus(req.getStatus());

                if (team != null) {

                    response.setTeamId(team.getTeamId());
                    response.setTeamName(team.getTeamName());

                    if (team.getTeamLead() != null) {
                        response.setTeamLead(
                                team.getTeamLead().getUser().getName()
                        );
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
            .toList();
}
public void scheduleMeeting(Long facultyId, ScheduleMeetingRequest req) {

    ProjectRequest request = projectRequestRepository
            .findById(req.getRequestId())
            .orElseThrow(() -> new RuntimeException("Request not found"));

    Project project = request.getProject();

    if (!project.getFaculty().getFacultyId().equals(facultyId)) {
        throw new RuntimeException("You cannot schedule meetings for other faculty projects");
    }

    Team team = request.getTeam();

    Meeting meeting = new Meeting();

    meeting.setRequest(request);
    meeting.setTeam(team);
    meeting.setProject(project);

    meeting.setTitle(req.getTitle());
    meeting.setLocation(req.getLocation());
    meeting.setMeetingLink(req.getMeetingLink());
    meeting.setMeetingTime(req.getMeetingTime());

    meeting.setStatus("SCHEDULED");

    meetingRepository.save(meeting);
}
public void cancelRequest(Long facultyId, Long requestId) {

    ProjectRequest request = projectRequestRepository
            .findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));

    if (!request.getProject().getFaculty().getFacultyId().equals(facultyId)) {
        throw new RuntimeException("You cannot cancel requests for other faculty projects");
    }

    projectRequestRepository.delete(request);
}
}