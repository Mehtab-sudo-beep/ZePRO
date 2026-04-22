package com.zepro.repository;

import com.zepro.model.ProjectRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.zepro.model.RequestStatus;

public interface ProjectRequestRepository extends JpaRepository<ProjectRequest, Long> {
    List<ProjectRequest> findByStatus(RequestStatus status);

    List<ProjectRequest> findByTeamTeamId(Long teamId);

    List<ProjectRequest> findByTeamTeamIdAndStatus(Long teamId, RequestStatus status);

    boolean existsByTeamTeamIdAndProjectProjectId(Long teamId, Long projectId);

    List<ProjectRequest> findByStatusAndProjectFacultyFacultyId(RequestStatus status, Long facultyId);

    List<ProjectRequest> findByFacultyFacultyIdAndStatus(Long facultyId, RequestStatus status);

    List<ProjectRequest> findByProjectProjectId(Long projectId);

}