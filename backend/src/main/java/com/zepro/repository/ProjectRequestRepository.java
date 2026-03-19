package com.zepro.repository;

import com.zepro.model.ProjectRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRequestRepository extends JpaRepository<ProjectRequest, Long> {
    List<ProjectRequest> findByStatus(String status);

    List<ProjectRequest> findByTeamTeamId(Long teamId);

    boolean existsByTeamTeamIdAndProjectProjectId(Long teamId, Long projectId);
    List<ProjectRequest> findByStatusAndProjectFacultyFacultyId(String status, Long facultyId);
    List<ProjectRequest> findByProjectProjectId(Long projectId);
}