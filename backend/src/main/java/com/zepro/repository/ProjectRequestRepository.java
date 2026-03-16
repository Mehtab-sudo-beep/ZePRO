package com.zepro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zepro.model.ProjectRequest;
import com.zepro.model.RequestStatus;

public interface ProjectRequestRepository extends JpaRepository<ProjectRequest, Long> {

    List<ProjectRequest> findByFacultyFacultyIdAndStatus(
            Long facultyId,
            RequestStatus status
    );

    Optional<ProjectRequest> findByTeamTeamId(Long teamId);

}