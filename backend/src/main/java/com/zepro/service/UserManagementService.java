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

                // 2. Reject all Project Requests because faculty is removed
                List<ProjectRequest> requests = projectRequestRepository.findByProjectProjectId(project.getProjectId());
                for (ProjectRequest req : requests) {
                    req.setStatus(RequestStatus.REJECTED);
                    req.setRejectionReason("Faculty is removed");
                    req.setFaculty(null); // Prevent FK violation
                    projectRequestRepository.save(req);
                }

                // 3. Cancel all meetings for this project
                List<Meeting> meetings = meetingRepository.findByProjectProjectId(project.getProjectId());
                for (Meeting m : meetings) {
                    m.setStatus(MeetingStatus.CANCELLED);
                    meetingRepository.save(m);
                }

                // 4. Set Project Status to CLOSED
                project.setStatus("CLOSED");
                project.setTeam(null);
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

                // If team is now empty, dissolve it and delete it
                if (team.getMembers().isEmpty()) {
                    dissolveTeam(team);
                    
                    // The team is being deleted. Let's find if it was allocated to a project.
                    Project p = projectRepository.findByTeam(team);
                    if (p != null) {
                        p.setTeam(null);
                        p.setStatus("IN_PROGRESS");
                        projectRepository.save(p);
                        
                        // User request: requests that went rejected will be reopened, same with meetings
                        List<ProjectRequest> otherRequests = projectRequestRepository.findByProjectProjectId(p.getProjectId());
                        for (ProjectRequest req : otherRequests) {
                            if (req.getStatus() == RequestStatus.REJECTED) {
                                req.setStatus(RequestStatus.PENDING);
                                projectRequestRepository.save(req);
                            }
                        }
                        
                        List<Meeting> otherMeetings = meetingRepository.findByProjectProjectId(p.getProjectId());
                        for (Meeting m : otherMeetings) {
                            if (m.getStatus() == MeetingStatus.CANCELLED) {
                                m.setStatus(MeetingStatus.PENDING); // Reopen meetings
                                meetingRepository.save(m);
                            }
                        }
                    }

                    // Delete all project requests for this team
                    List<ProjectRequest> teamRequests = projectRequestRepository.findByTeamTeamId(team.getTeamId());
                    projectRequestRepository.deleteAll(teamRequests);
                    
                    // Delete all meetings for this team
                    List<Meeting> teamMeetings = meetingRepository.findByTeamTeamId(team.getTeamId());
                    meetingRepository.deleteAll(teamMeetings);

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
        team.setFaculty(null); // Prevent FK violation
        
        // Unallocate members
        for (Student s : team.getMembers()) {
            s.setAllocated(false);
            s.setAllocatedProject(null);
            s.setAllocatedFaculty(null);
            studentRepository.save(s);
        }

        // Handle Meetings
        List<Meeting> meetings = meetingRepository.findByTeamTeamId(team.getTeamId());
        for (Meeting meeting : meetings) {
            meeting.setStatus(MeetingStatus.CANCELLED);
            meetingRepository.save(meeting);
        }

        teamRepository.save(team);
    }
}
