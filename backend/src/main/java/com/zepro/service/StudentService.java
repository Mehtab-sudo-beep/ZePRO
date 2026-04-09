package com.zepro.service;

import com.zepro.dto.student.*;
import com.zepro.model.Meeting;
import com.zepro.model.Project;
import com.zepro.model.ProjectRequest;
import com.zepro.model.Student;
import com.zepro.model.Team;

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
                        DepartmentRepository departmentRepository) {
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
        }

        // ------------------------------------------------
        // CREATE TEAM
        // ------------------------------------------------

        public TeamResponse createTeam(CreateTeamRequest request) {

                Student student = studentRepository.findById(request.getStudentId())
                                .orElseThrow(() -> new RuntimeException("Student not found"));
                if (student.getTeam() != null) {
                        throw new RuntimeException("Student already belongs to a team");
                }
                if (student.isInTeam()) {
                        throw new RuntimeException("Student already in a team");
                }

                Team team = new Team();
                team.setTeamName(request.getTeamName());
                team.setDescription(request.getDescription());
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

                int maxTeamSize = allocationRulesRepository.findById(1L).get().getMaxTeamSize();
                if (team.getMembers().size() >= maxTeamSize) {
                        throw new RuntimeException("Limit reached in the current team");
                }

                student.setTeam(team);
                student.setInTeam(true);
                student.setTeamLead(false);

                studentRepository.save(student);

                return "Successfully joined the team";
        }

        public List<ProjectResponse> getAllProjects(String email) {

            Student student = studentRepository.findByUser_Email(email)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

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
                        return availableSlots >= teamMemberSize;
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

                        int maxTeamSize = allocationRulesRepository.findById(1L)
                                .orElse(new com.zepro.model.AllocationRules()).getMaxTeamSize();
                        int projectAssigned = (project.getTeam() != null && project.getTeam().getMembers() != null) 
                                ? project.getTeam().getMembers().size() 
                                : 0;
                        int maxSlots = project.getStudentSlots();
                        int remainingSlots = Math.max(0, maxSlots - projectAssigned);

                        // ✅ NEW: Get faculty name
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
                                facultyName,      // ✅ NEW
                                facultyId);        // ✅ NEW
                    })
                    .toList();
        }
        // ------------------------------------------------
        // REQUEST PROJECT
        // ------------------------------------------------

        public String requestProject(ProjectRequestDTO request) {

            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

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

            // Use DTO if provided, otherwise use team members from database
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
            
            // ✅ SET INDIVIDUAL FIELDS
            req.setTeamMembersNames(names.toString());
            req.setTeamMembersRollNumbers(rollNumbers.toString());
            req.setTeamMembersCgpas(cgpas.toString());
            req.setTeamMembersResumeLinks(resumeLinks.toString());
            req.setTeamMembersMarkSheetLinks(markSheetLinks.toString());

            projectRequestRepository.save(req);

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

            Project project = projectRepository.findByTeam(team);

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

                String status = req.getStatus() != null ? req.getStatus().name() : "";

                // ✅ ACCEPTED — goes to completed
                if (status.equals("ACCEPTED")) {
                    completed.add(new CompletedRequestResponse(
                            req.getRequestId(),
                            req.getProject().getTitle(),
                            req.getProject().getFaculty().getUser().getName(),
                            "ACCEPTED",
                            req.getRejectionReason()));
                    continue;
                }

                // ✅ REJECTED — goes to completed
                if (status.equals("REJECTED")) {
                    completed.add(new CompletedRequestResponse(
                            req.getRequestId(),
                            req.getProject().getTitle(),
                            req.getProject().getFaculty().getUser().getName(),
                            "REJECTED",
                            req.getRejectionReason()));
                    continue;
                }

                // ✅ Check meeting for this request
                java.util.Optional<Meeting> meetingOpt = meetingRepository
                        .findByRequestRequestId(req.getRequestId());

                if (meetingOpt.isPresent()) {
                    Meeting meeting = meetingOpt.get();

                    // ✅ SCHEDULED meeting → upcoming
                    if (meeting.getStatus() == com.zepro.model.MeetingStatus.SCHEDULED) {
                        upcoming.add(new UpcomingRequestResponse(
                                req.getRequestId(),
                                req.getProject().getTitle(),
                                req.getProject().getFaculty().getUser().getName(),
                                meeting.getMeetingTime(),
                                meeting.getLocation(),
                                meeting.getMeetingLink()));
                    }

                    // ✅ DONE meeting but no accept/reject yet → completed
                    if (meeting.getStatus() == com.zepro.model.MeetingStatus.DONE) {
                        completed.add(new CompletedRequestResponse(
                                req.getRequestId(),
                                req.getProject().getTitle(),
                                req.getProject().getFaculty().getUser().getName(),
                                "MEETING COMPLETED", null));
                    }

                    // ✅ CANCELLED meeting → completed
                    if (meeting.getStatus() == com.zepro.model.MeetingStatus.CANCELLED) {
                        completed.add(new CompletedRequestResponse(
                                req.getRequestId(),
                                req.getProject().getTitle(),
                                req.getProject().getFaculty().getUser().getName(),
                                "CANCELLED", null));
                    }
                }
            }

            // ✅ Sort upcoming by meetingTime ascending
            upcoming.sort((a, b) -> {
                if (a.getMeetingTime() == null || b.getMeetingTime() == null)
                    return 0;
                return a.getMeetingTime().compareTo(b.getMeetingTime());
            });

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

            if (student.getTeam() != null) {
                throw new RuntimeException("Student already belongs to a team");
            }

            int maxTeamSize = allocationRulesRepository.findById(1L).get().getMaxTeamSize();
            if (team.getMembers().size() >= maxTeamSize) {
                throw new RuntimeException("Limit reached in the current team");
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

        public String rejectJoinRequest(Long requestId, String reason) {

            TeamJoinRequest request = joinRequestRepository.findById(requestId)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            request.setStatus("REJECTED");
            request.setRejectionReason(reason != null ? reason : "");
            joinRequestRepository.save(request);

            return "Request rejected";
        }

        public List<TeamListResponse> getAllTeams(Long studentId) {

            List<Team> teams = teamRepository.findAll();

            return teams.stream()
                    .map(team -> {

                            boolean alreadyRequested = joinRequestRepository
                                    .existsByStudentStudentIdAndTeamTeamId(studentId,
                                                    team.getTeamId());

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

        // ✅ COMPLETE STUDENT PROFILE
        public StudentProfileResponse completeStudentProfile(Long studentId, CompleteStudentProfileRequest request) {
            
            System.out.println("[StudentService] 📝 Completing student profile for ID: " + studentId);
            
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // ✅ Set all required fields
            student.setRollNumber(request.getRollNumber());
            student.setCgpa(request.getCgpa());
            student.setYear(request.getYear());
            student.setResumeLink(request.getResumeLink());
            student.setMarksheetLink(request.getMarksheetLink());
            
            // ✅ Set institute
            if (request.getInstituteId() != null) {
                Institute institute = instituteRepository.findById(request.getInstituteId())
                        .orElseThrow(() -> new RuntimeException("Institute not found"));
                student.setInstitute(institute);
            }
            
            // ✅ Set department
            if (request.getDepartmentId() != null) {
                Department department = departmentRepository.findById(request.getDepartmentId())
                        .orElseThrow(() -> new RuntimeException("Department not found"));
                student.setDepartment(department);
            }
            
            Student saved = studentRepository.save(student);
            
            System.out.println("[StudentService] ✅ Student profile completed");
            
            return new StudentProfileResponse(
                    saved.getStudentId(),
                    saved.getUser().getName(),
                    saved.getUser().getEmail(),
                    saved.getRollNumber(),
                    saved.getCgpa(),
                    saved.getYear(),
                    saved.getDepartment() != null ? saved.getDepartment().getDepartmentId() : null,
                    saved.getDepartment() != null ? saved.getDepartment().getDepartmentName() : null,
                    saved.getResumeLink(),
                    saved.getMarksheetLink(),
                    isProfileComplete(saved)
            );
        }

        // ✅ VALIDATE STUDENT PROFILE COMPLETION
        public boolean isProfileComplete(Student student) {
            return student.getRollNumber() != null && !student.getRollNumber().isEmpty() &&
                   student.getCgpa() > 0 &&
                   student.getYear() != null && !student.getYear().isEmpty() &&
                   student.getDepartment() != null &&
                   student.getResumeLink() != null && !student.getResumeLink().isEmpty() &&
                   student.getMarksheetLink() != null && !student.getMarksheetLink().isEmpty();
        }

        // ✅ GET STUDENT PROFILE STATUS
        public StudentProfileStatusResponse getProfileStatus(Long studentId) {
            
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            
            boolean isComplete = isProfileComplete(student);
            
            return new StudentProfileStatusResponse(
                    studentId,
                    isComplete,
                    student.getRollNumber(),
                    student.getCgpa(),
                    student.getYear(),
                    student.getDepartment() != null ? student.getDepartment().getDepartmentId() : null,
                    student.getResumeLink(),
                    student.getMarksheetLink()
            );
        }

        // ✅ GET ALL INSTITUTES
        public List<InstituteDTO> getAllInstitutes() {
            System.out.println("[StudentService] 🔍 Fetching all institutes");
            
            List<Institute> institutes = instituteRepository.findAll();
            
            return institutes.stream()
                    .map(institute -> new InstituteDTO(
                            institute.getInstituteId(),
                            institute.getInstituteName(),
                            institute.getInstituteCode()
                    ))
                    .toList();
        }

        // ✅ GET DEPARTMENTS BY INSTITUTE
        public List<DepartmentDTO> getDepartmentsByInstitute(Long instituteId) {
            System.out.println("[StudentService] 🔍 Fetching departments for institute: " + instituteId);
            
            Institute institute = instituteRepository.findById(instituteId)
                    .orElseThrow(() -> new RuntimeException("Institute not found"));
            
            return institute.getDepartments().stream()
                    .map(dept -> new DepartmentDTO(
                            dept.getDepartmentId(),
                            dept.getDepartmentName(),
                            dept.getDepartmentCode()
                    ))
                    .toList();
        }
    }