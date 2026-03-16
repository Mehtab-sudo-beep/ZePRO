package com.zepro.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.zepro.model.ProjectRequest;
import com.zepro.model.RequestStatus;
import com.zepro.repository.ProjectRequestRepository;

@Service
public class RequestService {

    private final ProjectRequestRepository requestRepository;

    public RequestService(ProjectRequestRepository requestRepository) {
        this.requestRepository = requestRepository;
    }

    // get pending requests for faculty
    public List<ProjectRequest> getPendingRequests(Long facultyId) {

        return requestRepository
                .findByFacultyFacultyIdAndStatus(
                        facultyId,
                        RequestStatus.PENDING
                );
    }

    // cancel request
    public ProjectRequest cancelRequest(Long requestId) {

        ProjectRequest request =
                requestRepository.findById(requestId)
                        .orElseThrow();

        request.setStatus(RequestStatus.CANCELLED);

        return requestRepository.save(request);
    }

}