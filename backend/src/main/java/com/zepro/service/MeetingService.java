package com.zepro.service;

import com.zepro.dto.faculty.CreateMeetingRequest;
import com.zepro.dto.faculty.MeetingResponse;
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
import com.zepro.model.Student;
import com.zepro.service.FacultyService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ProjectRequestRepository requestRepository;
    private final ProjectRepository projectRepository;
    private final ProjectDomainRepository projectDomainRepository;
    private final ProjectSubDomainRepository projectSubDomainRepository;
    private final StudentRepository studentRepository;
    private final FacultyService facultyService;

    public MeetingService(MeetingRepository meetingRepository,
            ProjectRequestRepository requestRepository,
            ProjectRepository projectRepository,
            ProjectDomainRepository projectDomainRepository,
            ProjectSubDomainRepository projectSubDomainRepository,
            StudentRepository studentRepository,
            FacultyService facultyService) {
        this.meetingRepository = meetingRepository;
        this.requestRepository = requestRepository;
        this.projectRepository = projectRepository;
        this.projectDomainRepository = projectDomainRepository;
        this.projectSubDomainRepository = projectSubDomainRepository;
        this.studentRepository = studentRepository;
        this.facultyService = facultyService;
    }

    // Schedule meeting
    @Transactional
    public MeetingResponse scheduleMeeting(CreateMeetingRequest request) {

        System.out.println("[MeetingService] 📅 Scheduling meeting for request: " + request.getRequestId());

        ProjectRequest projectRequest = requestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new RuntimeException("Project request not found"));

        // 🔒 Prevent duplicate scheduling
        if (meetingRepository.findByRequestRequestId(request.getRequestId()).isPresent()) {
            throw new RuntimeException("Meeting already scheduled for this request");
        }

        // ✅ Create meeting
        Meeting meeting = new Meeting();
        meeting.setRequest(projectRequest);
        meeting.setMeetingLink(request.getMeetingLink());
        meeting.setMeetingTime(request.getMeetingTime());
        meeting.setLocation(request.getLocation());
        meeting.setTitle(request.getTitle());
        // 🔥 FIX 1: Correct status
        meeting.setStatus(MeetingStatus.SCHEDULED);

        meetingRepository.save(meeting);

        // ✅ Request becomes scheduled
        projectRequest.setStatus(RequestStatus.SCHEDULED);
        requestRepository.save(projectRequest);

        // 🔥 FIX 2: Project should NOT be assigned yet
        Project project = projectRequest.getProject();
        if (project != null) {
            project.setStatus("IN_PROGRESS"); // ✅ NEW STATE
            projectRepository.save(project);
        }

        // ✅ UPDATE MAX SLOTS WHEN SCHEDULING
        if (projectRequest.getTeam() != null && projectRequest.getProject() != null) {
            int teamSize = projectRequest.getTeam().getMembers() != null 
                ? projectRequest.getTeam().getMembers().size() 
                : 0;
            
            facultyService.updateMaximumSlotsReached(projectRequest.getProject().getProjectId(), teamSize);
            System.out.println("[MeetingService] 📊 Updated max slots for project: " + teamSize);
        }

        System.out.println("Meeting saved successfully");
        System.out.println("Request APPROVED, Project moved to IN_PROGRESS");

        return mapToResponse(meeting);
    }

    // Cancel meeting
    public MeetingResponse cancelMeeting(Long meetingId) {

        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();

        meeting.setStatus(MeetingStatus.CANCELLED);

        meetingRepository.save(meeting);

        return mapToResponse(meeting);
    }

    // Mark meeting done
    public MeetingResponse completeMeeting(Long meetingId) {

        Meeting meeting = meetingRepository.findById(meetingId).orElseThrow();

        meeting.setStatus(MeetingStatus.DONE);
        meetingRepository.save(meeting);

        ProjectRequest request = meeting.getRequest();
        if (request != null) {
            request.setStatus(RequestStatus.COMPLETED);
            requestRepository.save(request);
        }

        // REMOVE THIS BLOCK
        // Project project = request.getProject();
        // project.setTeam(...)
        // project.setStatus("ASSIGNED")

        System.out.println("Meeting completed → waiting for faculty decision");

        return mapToResponse(meeting);
    }

    // Get meeting by request
    public MeetingResponse getMeetingByRequest(Long requestId) {

        Meeting meeting = meetingRepository.findByRequestRequestId(requestId).orElseThrow();

        return mapToResponse(meeting);
    }

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
        // 🔥 FIX STARTS HERE
        Project project = meeting.getRequest().getProject();

        if (project != null) {
            response.setProjectTitle(project.getTitle());

            if (meeting.getRequest() != null) {
                response.setRequestStatus(meeting.getRequest().getStatus().name());
                // requestId already set above, but make sure:
                response.setRequestId(meeting.getRequest().getRequestId());
            }

            // 🔥 DOMAIN
            String domainStr = "";
            var pDomains = projectDomainRepository
                    .findByProjectProjectId(project.getProjectId());

            if (!pDomains.isEmpty() && pDomains.get(0).getDomain() != null) {
                domainStr = pDomains.get(0).getDomain().getName();
            }

            // 🔥 SUBDOMAIN
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

    public List<MeetingResponse> getAllMeetings(Long facultyId) {

        return meetingRepository
                .findByRequestFacultyFacultyId(facultyId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ✅ ACCEPT
    public void acceptProject(Long requestId) {

        ProjectRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Project project = request.getProject();

        project.setTeam(request.getTeam());
        project.setStatus("ASSIGNED");

        projectRepository.save(project);

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

        // DROP OFF ALL OTHER PENDING/SCHEDULED REQUESTS FOR THIS PROJECT
        List<ProjectRequest> otherRequests = requestRepository.findByProjectProjectId(project.getProjectId());
        for (ProjectRequest other : otherRequests) {
            if (!other.getRequestId().equals(requestId) && 
                (other.getStatus() == RequestStatus.PENDING || other.getStatus() == RequestStatus.SCHEDULED)) {
                other.setStatus(RequestStatus.REJECTED);
                other.setRejectionReason("Already allotted to other team");
                requestRepository.save(other);
            }
        }

        // DROP OFF ALL OTHER PENDING/SCHEDULED REQUESTS FROM THIS TEAM FOR OTHER PROJECTS
        List<ProjectRequest> otherRequestsByTeam = requestRepository.findByTeamTeamId(request.getTeam().getTeamId());
        for (ProjectRequest other : otherRequestsByTeam) {
            if (!other.getRequestId().equals(requestId) && 
                (other.getStatus() == RequestStatus.PENDING || other.getStatus() == RequestStatus.SCHEDULED)) {
                other.setStatus(RequestStatus.REJECTED);
                other.setRejectionReason("One project is allowed per team");
                requestRepository.save(other);
            }
        }

        System.out.println("Project ACCEPTED and ASSIGNED");
    }

    // ✅ REJECT
    public void rejectProject(Long requestId, String rejectionReason) {

        ProjectRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(RequestStatus.REJECTED);
        request.setRejectionReason(rejectionReason);
        requestRepository.save(request);

        System.out.println("Project REJECTED with reason: " + rejectionReason);
    }
    public MeetingResponse rescheduleMeeting(Long requestId, CreateMeetingRequest req) {

        Meeting meeting = meetingRepository.findByRequestRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Meeting not found for request"));

        meeting.setMeetingLink(req.getMeetingLink());
        meeting.setMeetingTime(req.getMeetingTime());
        meeting.setLocation(req.getLocation());
        meeting.setTitle(req.getTitle());
        meeting.setStatus(MeetingStatus.SCHEDULED);

        meetingRepository.save(meeting);

        System.out.println("Meeting RESCHEDULED successfully");

        return mapToResponse(meeting);
    }
}