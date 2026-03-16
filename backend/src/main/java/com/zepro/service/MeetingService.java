package com.zepro.service;

import com.zepro.dto.faculty.CreateMeetingRequest;
import com.zepro.dto.faculty.MeetingResponse;
import com.zepro.model.Meeting;
import com.zepro.model.MeetingStatus;
import com.zepro.model.ProjectRequest;
import com.zepro.model.RequestStatus;
import com.zepro.repository.MeetingRepository;
import com.zepro.repository.ProjectRequestRepository;

import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final ProjectRequestRepository requestRepository;

    public MeetingService(MeetingRepository meetingRepository,
                          ProjectRequestRepository requestRepository) {
        this.meetingRepository = meetingRepository;
        this.requestRepository = requestRepository;
    }

    // Schedule meeting
  public MeetingResponse scheduleMeeting(CreateMeetingRequest request) {

    System.out.println("Scheduling meeting...");
    System.out.println("Request ID: " + request.getRequestId());
    System.out.println("Meeting Link: " + request.getMeetingLink());
    System.out.println("Meeting Time: " + request.getMeetingTime());

    ProjectRequest projectRequest =
            requestRepository.findById(request.getRequestId())
                    .orElseThrow(() -> new RuntimeException("Request not found"));

    // Create meeting
    Meeting meeting = new Meeting();
    meeting.setRequest(projectRequest);
    meeting.setMeetingLink(request.getMeetingLink());
    meeting.setMeetingTime(request.getMeetingTime());
    meeting.setStatus(MeetingStatus.PENDING);

    meetingRepository.save(meeting);

    projectRequest.setStatus(RequestStatus.APPROVED);
    requestRepository.save(projectRequest);

    System.out.println("Meeting saved successfully");
    System.out.println("Request marked as APPROVED");

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

        return mapToResponse(meeting);
    }

    // Get meeting by request
    public MeetingResponse getMeetingByRequest(Long requestId) {

        Meeting meeting =
                meetingRepository.findByRequestRequestId(requestId).orElseThrow();

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

    return response;
}
    public List<MeetingResponse> getAllMeetings() {

    return meetingRepository.findAll()
            .stream()
            .map(this::mapToResponse)
            .toList();
}
}