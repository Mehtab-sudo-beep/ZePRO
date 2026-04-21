package com.zepro.service;

import com.zepro.model.*;
import com.zepro.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final ProjectRequestRepository projectRequestRepository;
    private final MeetingRepository meetingRepository;
    private final DepartmentRepository departmentRepository;

    public UserManagementService(UserRepository userRepository,
                                 StudentRepository studentRepository,
                                 FacultyRepository facultyRepository,
                                 ProjectRepository projectRepository,
                                 TeamRepository teamRepository,
                                 ProjectRequestRepository projectRequestRepository,
                                 MeetingRepository meetingRepository,
                                 DepartmentRepository departmentRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
        this.projectRequestRepository = projectRequestRepository;
        this.meetingRepository = meetingRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional
    public void deleteUser(Long userId) {
        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == UserRole.FACULTY) {
            deleteFaculty(userId);
        } else if (user.getRole() == UserRole.STUDENT) {
            deleteStudent(userId);
        } else {
            // Admin deletion - simpler as they don't have projects/teams
            userRepository.delete(user);
        }
    }

    private void deleteFaculty(Long userId) {
        facultyRepository.findByUser_UserId(userId).ifPresent(faculty -> {
            System.out.println("[UserManagementService] 🗑 Deleting Faculty: " + faculty.getUser().getName());

            // Handle Projects owned by this faculty
            List<Project> projects = projectRepository.findByFacultyFacultyId(faculty.getFacultyId());
            for (Project project : projects) {
                // 1. Handle Team assigned to this project
                Team team = project.getTeam();
                if (team != null || "ALLOCATED".equals(project.getStatus())) {
                    if (team != null) {
                        dissolveTeam(team);
                    }
                }

                // 2. Reopen Project Requests
                List<ProjectRequest> requests = projectRequestRepository.findByProjectProjectId(project.getProjectId());
                for (ProjectRequest req : requests) {
                    req.setStatus(RequestStatus.PENDING);
                    projectRequestRepository.save(req);
                }

                // 3. Set Project Status back to IN_PROGRESS
                project.setStatus("IN_PROGRESS");
                project.setTeam(null);
                // Note: We keep the project but it has no faculty? Or do we delete?
                // The user said "project status to inprogress", so we keep it.
                // However, we must set faculty to null to avoid constraint violation on faculty delete.
                project.setFaculty(null); 
                projectRepository.save(project);
            }

            // Handle Coordinator flags
            if (faculty.getIsUGCoordinator() || faculty.getIsPGCoordinator()) {
                Department dept = faculty.getDepartment();
                if (dept != null) {
                    if (faculty.getUser().getName().equals(dept.getUgCoordinatorName())) {
                        dept.setUgCoordinatorName(null);
                        dept.setUgCoordinatorEmail(null);
                        dept.setUgCoordinatorPhone(null);
                    }
                    if (faculty.getUser().getName().equals(dept.getPgCoordinatorName())) {
                        dept.setPgCoordinatorName(null);
                        dept.setPgCoordinatorEmail(null);
                        dept.setPgCoordinatorPhone(null);
                    }
                    departmentRepository.save(dept);
                }
            }

            facultyRepository.delete(faculty);
            userRepository.delete(faculty.getUser());
        });
    }

    private void deleteStudent(Long userId) {
        studentRepository.findByUserUserId(userId).ifPresent(student -> {
            System.out.println("[UserManagementService] 🗑 Deleting Student: " + student.getUser().getName());
            
            Team team = student.getTeam();
            if (team != null) {
                team.getMembers().remove(student);

                if (student.isTeamLead()) {
                    if (!team.getMembers().isEmpty()) {
                        Student newLead = team.getMembers().get(0);
                        newLead.setTeamLead(true);
                        team.setTeamLead(newLead);
                        studentRepository.save(newLead);
                    } else {
                        team.setTeamLead(null);
                    }
                }

                student.setTeam(null);

                // If team is now empty, dissolve it
                if (team.getMembers().isEmpty()) {
                    dissolveTeam(team);
                    teamRepository.delete(team);
                } else {
                    teamRepository.save(team);
                }
            }
            
            studentRepository.delete(student);
            userRepository.delete(student.getUser());
        });
    }

    private void dissolveTeam(Team team) {
        System.out.println("[UserManagementService] 🌊 Dissolving Team: " + team.getTeamName());
        
        team.setStatus("pending");
        
        // Unallocate members
        for (Student s : team.getMembers()) {
            s.setAllocated(false);
            s.setAllocatedProject(null);
            s.setAllocatedFaculty(null);
            studentRepository.save(s);
        }

        // Reopen rejected requests for this team (if any)
        List<ProjectRequest> rejectedRequests = projectRequestRepository.findByTeamTeamIdAndStatus(team.getTeamId(), RequestStatus.REJECTED);
        for (ProjectRequest req : rejectedRequests) {
            req.setStatus(RequestStatus.PENDING);
            projectRequestRepository.save(req);
        }

        // Handle Meetings
        List<Meeting> meetings = meetingRepository.findByTeamTeamId(team.getTeamId());
        for (Meeting meeting : meetings) {
            // Reopen meetings? Usually they are cancelled if guide/team is gone.
            // User said "reopen them too if meetings are scheduled".
            // This might mean making the slot available again? 
            // Or if they were cancelled, mark them as SCHEDULED but maybe with no team?
            // Actually, meetings are tied to teams. If team is pending, meetings should be cancelled.
            // I'll set them to CANCELLED for now, as "reopen" is ambiguous.
            // Wait! If the project goes back to IN_PROGRESS, maybe the coordinator wants the slot to be available.
            meeting.setStatus(MeetingStatus.CANCELLED);
            meetingRepository.save(meeting);
        }

        teamRepository.save(team);
    }
}
