package com.zepro.service;

import com.zepro.dto.faculty.CreateMeetingRequest;
import com.zepro.dto.faculty.MeetingResponse;
import com.zepro.model.Faculty;
import com.zepro.model.Meeting;
import com.zepro.model.MeetingStatus;
import com.zepro.model.Project;
import com.zepro.model.ProjectRequest;
import com.zepro.model.RequestStatus;
import com.zepro.repository.MeetingRepository;
import com.zepro.repository.ProjectRepository;
import com.zepro.repository.ProjectRequestRepository;
import com.zepro.repository.ProjectDomainRepository;
import com.zepro.repository.ProjectSubDomainRepository;
import com.zepro.repository.StudentRepository;
import com.zepro.repository.TeamRepository;
import com.zepro.repository.DeactivatedMeetingRepository;
import com.zepro.model.Student;
import com.zepro.model.DeactivatedMeeting;
import com.zepro.service.FacultyService;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ProjectRequestRepository requestRepository;
    private final ProjectRepository projectRepository;
    private final ProjectDomainRepository projectDomainRepository;
    private final ProjectSubDomainRepository projectSubDomainRepository;
    private final StudentRepository studentRepository;
    private final FacultyService facultyService;
    private final TeamRepository teamRepository;
    private final DeactivatedMeetingRepository deactivatedMeetingRepository;
    private final com.zepro.repository.DepartmentDeadlinesRepository departmentDeadlinesRepository;
    private final EmailService emailService;

    public MeetingService(MeetingRepository meetingRepository,
            ProjectRequestRepository requestRepository,
            ProjectRepository projectRepository,
            ProjectDomainRepository projectDomainRepository,
            ProjectSubDomainRepository projectSubDomainRepository,
            StudentRepository studentRepository,
            FacultyService facultyService,
            TeamRepository teamRepository,
            DeactivatedMeetingRepository deactivatedMeetingRepository,
            com.zepro.repository.DepartmentDeadlinesRepository departmentDeadlinesRepository,
            EmailService emailService) {
        this.meetingRepository = meetingRepository;
        this.requestRepository = requestRepository;
        this.projectRepository = projectRepository;
        this.projectDomainRepository = projectDomainRepository;
        this.projectSubDomainRepository = projectSubDomainRepository;
        this.studentRepository = studentRepository;
        this.facultyService = facultyService;
        this.teamRepository = teamRepository;
        this.deactivatedMeetingRepository = deactivatedMeetingRepository;
        this.departmentDeadlinesRepository = departmentDeadlinesRepository;
        this.emailService = emailService;
    }

    // ------------------------------------------------
    // DEADLINE CHECKER
    // ------------------------------------------------
    private void checkMeetingSchedulingDeadline(Long departmentId, LocalDateTime proposedTime) {
        if (departmentId == null || proposedTime == null) return;
        departmentDeadlinesRepository.findByDepartment_DepartmentId(departmentId)
            .ifPresent(deadlines -> {
                if (deadlines.getMeetingSchedulingDeadline() != null && 
                    proposedTime.isAfter(deadlines.getMeetingSchedulingDeadline())) {
                    throw new RuntimeException("The selected meeting date cannot be after the official department deadline.");
                }
            });
    }

    // ✅ SCHEDULE MEETING
    @Transactional
    public MeetingResponse scheduleMeeting(CreateMeetingRequest request) {

        System.out.println("[MeetingService] 📅 Scheduling meeting for request: " + request.getRequestId());

        ProjectRequest projectRequest = requestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new RuntimeException("Project request not found"));

        Project project = projectRequest.getProject();
        
        // ✅ CHECK 1: Project status must NOT be ASSIGNED or CLOSE
        if ("ASSIGNED".equals(project.getStatus())) {
            throw new RuntimeException("Cannot schedule meeting. Project is already assigned to another team");
        }
        
        if ("CLOSE".equals(project.getStatus())) {
            throw new RuntimeException("Cannot schedule meeting. Project has been closed");
        }

        // ✅ CHECK 2: Prevent duplicate scheduling
        if (meetingRepository.findByRequestRequestId(request.getRequestId()).isPresent()) {
            throw new RuntimeException("Meeting already scheduled for this request");
        }

        // ✅ CHECK 3: Meeting Scheduling Deadline
        Long departmentId = projectRequest.getFaculty().getDepartment() != null 
            ? projectRequest.getFaculty().getDepartment().getDepartmentId() : null;
        checkMeetingSchedulingDeadline(departmentId, request.getMeetingTime());

        // ✅ Create meeting
        Meeting meeting = new Meeting();
        meeting.setRequest(projectRequest);
        meeting.setMeetingLink(request.getMeetingLink());
        meeting.setMeetingTime(request.getMeetingTime());
        meeting.setLocation(request.getLocation());
        meeting.setTitle(request.getTitle());
        meeting.setStatus(MeetingStatus.SCHEDULED);
        

        meetingRepository.save(meeting);

        // ✅ Request becomes scheduled
        projectRequest.setStatus(RequestStatus.SCHEDULED);
        requestRepository.save(projectRequest);

        // ✅ Project moves to IN_PROGRESS
        project.setStatus("IN_PROGRESS");
        project.setPreviousStatus(project.getPresentStatus());
        project.setPresentStatus("IN_PROGRESS");
        projectRepository.save(project);

        // ✅ UPDATE MAX SLOTS WHEN SCHEDULING
        if (projectRequest.getTeam() != null && projectRequest.getProject() != null) {
            int teamSize = projectRequest.getTeam().getMembers() != null 
                ? projectRequest.getTeam().getMembers().size() 
                : 0;
            
            facultyService.updateMaximumSlotsReached(projectRequest.getProject().getProjectId(), teamSize);
            System.out.println("[MeetingService] 📊 Updated max slots for project: " + teamSize);
        }

        System.out.println("[MeetingService] ✅ Meeting scheduled successfully");

        return mapToResponse(meeting);
    }

    // ✅ CANCEL MEETING
    @Transactional
    public MeetingResponse cancelMeeting(Long meetingId) {

        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));
        
        Project project = meeting.getRequest().getProject();

        // ✅ Check 1: Project status must NOT be ASSIGNED or CLOSE
        if ("ASSIGNED".equals(project.getStatus())) {
            throw new RuntimeException("Cannot cancel meeting. Project is already assigned to another team");
        }
        
        if ("CLOSE".equals(project.getStatus())) {
            throw new RuntimeException("Cannot cancel meeting. Project has been closed");
        }

        // ✅ Check 2: Meeting must be SCHEDULED or DONE
        if (meeting.getStatus() == MeetingStatus.CANCELLED) {
            throw new RuntimeException("Meeting is already cancelled");
        }

        System.out.println("[MeetingService] ❌ Cancelling meeting: " + meetingId);
        
        meeting.setStatus(MeetingStatus.CANCELLED);
        meetingRepository.save(meeting);

        // ✅ Also revert request status to PENDING
        ProjectRequest request = meeting.getRequest();
        if (request != null && request.getStatus() == RequestStatus.SCHEDULED) {
            request.setStatus(RequestStatus.CANCELLED);
            requestRepository.save(request);            
            System.out.println("[MeetingService] 🔄 Request reverted to CANCELLED");
        }

        return mapToResponse(meeting);
    }

    // ✅ COMPLETE/MARK DONE MEETING
    @Transactional
    public MeetingResponse completeMeeting(Long meetingId) {

        Meeting meeting = meetingRepository.findById(meetingId)
                .orElseThrow(() -> new RuntimeException("Meeting not found"));

        Project project = meeting.getRequest().getProject();

        // ✅ Check 1: Project status must NOT be ASSIGNED or CLOSE
        if ("ASSIGNED".equals(project.getStatus())) {
            throw new RuntimeException("Cannot complete meeting. Project is already assigned to another team");
        }
        
        if ("CLOSE".equals(project.getStatus())) {
            throw new RuntimeException("Cannot complete meeting. Project has been closed");
        }

        // ✅ Check 2: Meeting must be SCHEDULED
        if (meeting.getStatus() != MeetingStatus.SCHEDULED) {
            throw new RuntimeException("Only SCHEDULED meetings can be marked as done");
        }

        System.out.println("[MeetingService] ✅ Completing meeting: " + meetingId);
        
        meeting.setStatus(MeetingStatus.DONE);
        meetingRepository.save(meeting);

        // ✅ Request stays SCHEDULED (waiting for faculty decision)
        ProjectRequest request = meeting.getRequest();
        if (request != null) {
            request.setStatus(RequestStatus.SCHEDULED);
            requestRepository.save(request);
        }

        System.out.println("[MeetingService] ⏳ Meeting completed → waiting for faculty decision");

        return mapToResponse(meeting);
    }

    // ✅ GET MEETING BY REQUEST
    public MeetingResponse getMeetingByRequest(Long requestId) {

        Meeting meeting = meetingRepository.findByRequestRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Meeting not found for request"));

        return mapToResponse(meeting);
    }

    // ✅ GET ALL MEETINGS (ONLY FOR NON-CLOSED PROJECTS)
    public List<MeetingResponse> getAllMeetings(Long facultyId) {
        
        System.out.println("[MeetingService] 📡 Fetching all meetings for faculty: " + facultyId);
        
        return meetingRepository
                .findByRequestFacultyFacultyId(facultyId)
                .stream()
                .filter(meeting -> {
                    // ✅ Only include meetings whose project status is NOT CLOSE
                    String projectStatus = meeting.getRequest().getProject().getStatus();
                    boolean isNotClosed = !("CLOSE".equals(projectStatus));
                    
                    if (!isNotClosed) {
                        System.out.println("[MeetingService] 🚫 Filtering out meeting for closed project: " + meeting.getMeetingId());
                    }
                    
                    return isNotClosed;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ ACCEPT PROJECT (WITH PROJECT STATUS VALIDATION)
    @Transactional
    public void acceptProject(Long requestId) {

        System.out.println("[MeetingService] ✅ Accepting project for request: " + requestId);

        ProjectRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Project project = request.getProject();

        // ✅ Check 1: Project status must NOT be ASSIGNED or CLOSE
        if ("ASSIGNED".equals(project.getStatus())) {
            throw new RuntimeException("Cannot accept. Project is already assigned to another team");
        }
        
        if ("CLOSE".equals(project.getStatus())) {
            throw new RuntimeException("Cannot accept. Project has been closed");
        }

        // ✅ Assign project to team
        project.setTeam(request.getTeam());
        project.setStatus("ASSIGNED");
        project.setPreviousStatus(project.getPresentStatus());
        project.setPresentStatus("ASSIGNED");
        Faculty faculty = project.getFaculty();
        projectRepository.save(project);

        // ✅ Update request status
        request.setStatus(RequestStatus.ACCEPTED);
        requestRepository.save(request);

        // ✅ ALLOCATE PROJECT FOR ALL TEAM MEMBERS
        if (request.getTeam() != null && request.getTeam().getMembers() != null) {
            for (Student student : request.getTeam().getMembers()) {
                student.setAllocated(true);
                student.setAllocatedFaculty(request.getFaculty());
                studentRepository.save(student);
            }
        }

        // ✅ UPDATE TEAM STATUS
        if (request.getTeam() != null) {
            request.getTeam().setFaculty(faculty);
            request.getTeam().setStatus("ASSIGNED");
            teamRepository.save(request.getTeam());
        }

        // ✅ REJECT ALL OTHER PENDING/SCHEDULED REQUESTS FOR THIS PROJECT
        List<ProjectRequest> otherRequests = requestRepository.findByProjectProjectId(project.getProjectId());
        for (ProjectRequest other : otherRequests) {
            if (!other.getRequestId().equals(requestId) && 
                (other.getStatus() == RequestStatus.PENDING || other.getStatus() == RequestStatus.SCHEDULED)) {
                
                other.setStatus(RequestStatus.REJECTED);
                other.setRejectionReason("Allotted to other team");
                requestRepository.save(other);
                
                // ✅ CANCEL related meetings with reason "Allotted to other team"
                meetingRepository.findByRequestRequestId(other.getRequestId()).ifPresent(meeting -> {
                    System.out.println("[MeetingService] ❌ Cancelling meeting for rejected request: " + meeting.getMeetingId());
                    
                    meeting.setStatus(MeetingStatus.CANCELLED);
                    meetingRepository.save(meeting);
                });
            }
        }

        // ✅ REJECT ALL OTHER PENDING/SCHEDULED REQUESTS FROM THIS TEAM FOR OTHER PROJECTS
        List<ProjectRequest> otherRequestsByTeam = requestRepository.findByTeamTeamId(request.getTeam().getTeamId());
        for (ProjectRequest other : otherRequestsByTeam) {
            if (!other.getRequestId().equals(requestId) && 
                (other.getStatus() == RequestStatus.PENDING || other.getStatus() == RequestStatus.SCHEDULED)) {
                
                other.setStatus(RequestStatus.REJECTED);
                other.setRejectionReason("One project is allowed per team");
                requestRepository.save(other);
                
                // ✅ CANCEL related meetings
                meetingRepository.findByRequestRequestId(other.getRequestId()).ifPresent(meeting -> {
                    System.out.println("[MeetingService] ❌ Cancelling meeting for team's other project: " + meeting.getMeetingId());
                    
                    meeting.setStatus(MeetingStatus.CANCELLED);
                    meetingRepository.save(meeting);
                });
            }
        }

        // ✅ ASYNC EMAIL DISPATCH TO TEAM MEMBERS
        if (request.getTeam() != null && request.getTeam().getMembers() != null) {
            List<String> studentEmails = request.getTeam().getMembers().stream()
                    .filter(s -> s.getUser() != null && s.getUser().getEmail() != null)
                    .map(s -> s.getUser().getEmail())
                    .toList();
            
            String facultyName = (faculty != null && faculty.getUser() != null && faculty.getUser().getName() != null) 
                    ? faculty.getUser().getName() : "Your Faculty";
            String projectName = project.getTitle() != null ? project.getTitle() : "Project";

            emailService.sendProjectAcceptanceEmail(studentEmails, projectName, facultyName);
        }

        System.out.println("[MeetingService] ✅ Project ACCEPTED and ASSIGNED");
    }

    // ✅ REJECT PROJECT (WITH PROJECT STATUS VALIDATION)
    @Transactional
    public void rejectProject(Long requestId, String rejectionReason) {

        System.out.println("[MeetingService] ❌ Rejecting project for request: " + requestId);

        ProjectRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Project project = request.getProject();

        // ✅ Check: Project status must NOT be ASSIGNED or CLOSE
        if ("ASSIGNED".equals(project.getStatus())) {
            throw new RuntimeException("Cannot reject. Project is already assigned to another team");
        }
        
        if ("CLOSE".equals(project.getStatus())) {
            throw new RuntimeException("Cannot reject. Project has been closed");
        }

        request.setStatus(RequestStatus.REJECTED);
        request.setRejectionReason(rejectionReason);
        requestRepository.save(request);

        System.out.println("[MeetingService] ✅ Project REJECTED with reason: " + rejectionReason);
    }

    // ✅ RESCHEDULE MEETING (WITH PROJECT STATUS VALIDATION)
    @Transactional
    public MeetingResponse rescheduleMeeting(Long requestId, CreateMeetingRequest req) {

        System.out.println("[MeetingService] 🔄 Rescheduling meeting for request: " + requestId);

        Meeting meeting = meetingRepository.findByRequestRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Meeting not found for request"));

        Project project = meeting.getRequest().getProject();

        // ✅ Check 1: Project status must NOT be ASSIGNED or CLOSE
        if ("ASSIGNED".equals(project.getStatus())) {
            throw new RuntimeException("Cannot reschedule meeting. Project is already assigned to another team");
        }
        
        if ("CLOSE".equals(project.getStatus())) {
            throw new RuntimeException("Cannot reschedule meeting. Project has been closed");
        }

        // ✅ Check 2: Meeting must be SCHEDULED or DONE
        if (meeting.getStatus() == MeetingStatus.CANCELLED) {
            throw new RuntimeException("Cannot reschedule a cancelled meeting");
        }

        // ✅ Check 3: Meeting Scheduling Deadline
        Long departmentId = meeting.getRequest().getFaculty().getDepartment() != null 
            ? meeting.getRequest().getFaculty().getDepartment().getDepartmentId() : null;
        checkMeetingSchedulingDeadline(departmentId, req.getMeetingTime());

        meeting.setMeetingLink(req.getMeetingLink());
        meeting.setMeetingTime(req.getMeetingTime());
        meeting.setLocation(req.getLocation());
        meeting.setTitle(req.getTitle());
        meeting.setStatus(MeetingStatus.SCHEDULED);

        meetingRepository.save(meeting);

        System.out.println("[MeetingService] ✅ Meeting RESCHEDULED successfully");

        return mapToResponse(meeting);
    }

    // ✅ HELPER METHOD: Map Meeting to Response
    private MeetingResponse mapToResponse(Meeting meeting) {

        MeetingResponse response = new MeetingResponse();

        response.setMeetingId(meeting.getMeetingId());
        response.setRequestId(meeting.getRequest().getRequestId());

        response.setMeetingLink(meeting.getMeetingLink());
        response.setMeetingTime(meeting.getMeetingTime());
        response.setStatus(meeting.getStatus().name());

        response.setTeamId(meeting.getRequest().getTeam().getTeamId());
        response.setTeamName(meeting.getRequest().getTeam().getTeamName());

        response.setFacultyId(meeting.getRequest().getFaculty().getFacultyId());
        response.setLocation(meeting.getLocation());
        response.setTitle(meeting.getTitle());

        Project project = meeting.getRequest().getProject();

        if (project != null) {
            response.setProjectTitle(project.getTitle());
            

            if (meeting.getRequest() != null) {
                response.setRequestStatus(meeting.getRequest().getStatus().name());
                response.setRequestId(meeting.getRequest().getRequestId());
            }

            // ✅ DOMAIN
            String domainStr = "";
            var pDomains = projectDomainRepository
                    .findByProjectProjectId(project.getProjectId());

            if (!pDomains.isEmpty() && pDomains.get(0).getDomain() != null) {
                domainStr = pDomains.get(0).getDomain().getName();
            }

            // ✅ SUBDOMAIN
            String subdomainStr = "";
            var pSubDomains = projectSubDomainRepository
                    .findByProjectProjectId(project.getProjectId());

            if (!pSubDomains.isEmpty() && pSubDomains.get(0).getSubDomain() != null) {
                subdomainStr = pSubDomains.get(0).getSubDomain().getName();
            }

            response.setDomain(domainStr);
            response.setSubDomain(subdomainStr);
        }

        return response;
    }
}